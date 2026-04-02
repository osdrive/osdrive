use std::error::Error;
use std::ffi::{CString, c_char, c_void};
use std::ptr;

type Boolean = u8;
type CFIndex = isize;
type CFOptionFlags = usize;
type CFAllocatorRef = *const c_void;
type CFArrayRef = *const c_void;
type CFStringEncoding = u32;
type CFStringRef = *const c_void;
type CFTypeRef = *const c_void;
type MDItemRef = *const c_void;
type MDQueryRef = *const c_void;

const K_CFSTRING_ENCODING_UTF8: CFStringEncoding = 0x0800_0100;
const K_MDQUERY_SYNCHRONOUS: CFOptionFlags = 1;

#[link(name = "CoreFoundation", kind = "framework")]
unsafe extern "C" {
    fn CFRelease(cf: CFTypeRef);
    fn CFStringCreateWithCString(
        alloc: CFAllocatorRef,
        c_str: *const c_char,
        encoding: CFStringEncoding,
    ) -> CFStringRef;
    fn CFStringGetCString(
        the_string: CFStringRef,
        buffer: *mut c_char,
        buffer_size: CFIndex,
        encoding: CFStringEncoding,
    ) -> Boolean;
    fn CFStringGetLength(the_string: CFStringRef) -> CFIndex;
    fn CFStringGetMaximumSizeForEncoding(length: CFIndex, encoding: CFStringEncoding) -> CFIndex;
}

#[link(name = "CoreServices", kind = "framework")]
unsafe extern "C" {
    static kMDItemPath: CFStringRef;

    fn MDItemCopyAttribute(item: MDItemRef, name: CFStringRef) -> CFTypeRef;
    fn MDQueryCreate(
        allocator: CFAllocatorRef,
        query_string: CFStringRef,
        value_list_attrs: CFArrayRef,
        sorting_attrs: CFArrayRef,
    ) -> MDQueryRef;
    fn MDQueryExecute(query: MDQueryRef, option_flags: CFOptionFlags) -> Boolean;
    fn MDQueryGetResultAtIndex(query: MDQueryRef, idx: CFIndex) -> CFTypeRef;
    fn MDQueryGetResultCount(query: MDQueryRef) -> CFIndex;
}

struct ScopedCf(CFTypeRef);

impl ScopedCf {
    fn new(ptr: CFTypeRef) -> Option<Self> {
        if ptr.is_null() { None } else { Some(Self(ptr)) }
    }

    fn as_ptr(&self) -> CFTypeRef {
        self.0
    }
}

impl Drop for ScopedCf {
    fn drop(&mut self) {
        unsafe {
            CFRelease(self.0);
        }
    }
}

fn cfstring(text: &str) -> Result<ScopedCf, Box<dyn Error>> {
    let text = CString::new(text)?;
    let value =
        unsafe { CFStringCreateWithCString(ptr::null(), text.as_ptr(), K_CFSTRING_ENCODING_UTF8) };

    ScopedCf::new(value).ok_or_else(|| "failed to create CFString".into())
}

fn cfstring_to_string(value: CFStringRef) -> Result<String, Box<dyn Error>> {
    let length = unsafe { CFStringGetLength(value) };
    let capacity = unsafe { CFStringGetMaximumSizeForEncoding(length, K_CFSTRING_ENCODING_UTF8) };
    let mut buffer = vec![0u8; capacity as usize + 1];
    let ok = unsafe {
        CFStringGetCString(
            value,
            buffer.as_mut_ptr().cast(),
            buffer.len() as CFIndex,
            K_CFSTRING_ENCODING_UTF8,
        )
    };

    if ok == 0 {
        return Err("failed to convert CFString to UTF-8".into());
    }

    let end = buffer
        .iter()
        .position(|&byte| byte == 0)
        .unwrap_or(buffer.len());
    Ok(String::from_utf8(buffer[..end].to_vec())?)
}

fn main() -> Result<(), Box<dyn Error>> {
    let query_text = cfstring("kMDItemFSName != \"\" && kMDItemContentType != \"public.folder\"")?;
    let query = unsafe {
        MDQueryCreate(
            ptr::null(),
            query_text.as_ptr().cast(),
            ptr::null(),
            ptr::null(),
        )
    };
    let query = ScopedCf::new(query.cast()).ok_or("failed to create Spotlight query")?;

    let ok = unsafe { MDQueryExecute(query.as_ptr().cast(), K_MDQUERY_SYNCHRONOUS) };
    if ok == 0 {
        return Err("failed to execute Spotlight query".into());
    }

    let result_count = unsafe { MDQueryGetResultCount(query.as_ptr().cast()) };

    for index in 0..result_count {
        let item = unsafe { MDQueryGetResultAtIndex(query.as_ptr().cast(), index) };
        if item.is_null() {
            continue;
        }

        let path = unsafe { MDItemCopyAttribute(item.cast(), kMDItemPath) };
        let Some(path) = ScopedCf::new(path) else {
            continue;
        };

        let path = match cfstring_to_string(path.as_ptr()) {
            Ok(path) => path,
            Err(_) => continue,
        };

        // println!("{path}");
    }

    Ok(())
}

use od_db::{Db, DbBuilder, DbStats, InputEntry};

#[test]
fn roundtrip_preserves_structure_and_metadata() {
    let mut builder = DbBuilder::new();
    builder
        .add_entry(InputEntry {
            path: b"/tmp",
            is_dir: true,
            size: 0,
            created_unix_ns: 10,
            modified_unix_ns: 11,
        })
        .unwrap();
    builder
        .add_entry(InputEntry {
            path: b"/tmp/example.txt",
            is_dir: false,
            size: 42,
            created_unix_ns: 12,
            modified_unix_ns: 13,
        })
        .unwrap();

    let (bytes, summary) = builder.build_bytes_with_summary().unwrap();
    assert_eq!(
        summary.stats,
        DbStats {
            explicit_dirs: 2,
            explicit_files: 1,
            explicit_nodes: 3,
        }
    );

    let db = Db::from_bytes(bytes).unwrap();
    assert_eq!(db.summary(), summary);
    let tmp = db.lookup_path(b"/tmp").unwrap();
    let file = db.lookup_path(b"/tmp/example.txt").unwrap();

    let tmp_record = db.get(tmp).unwrap();
    assert!(tmp_record.is_dir);
    assert!(tmp_record.is_explicit);
    assert_eq!(tmp_record.created_unix_ns, 10);

    let file_record = db.get(file).unwrap();
    assert!(!file_record.is_dir);
    assert!(file_record.is_explicit);
    assert_eq!(file_record.size, 42);
    assert_eq!(file_record.modified_unix_ns, 13);
    assert_eq!(db.parent(file), Some(tmp));
    assert_eq!(db.path_bytes(file).unwrap().as_ref(), b"/tmp/example.txt");
}

#[test]
fn implicit_directories_are_created_and_can_be_upgraded() {
    let mut builder = DbBuilder::new();
    builder
        .add_entry(InputEntry {
            path: b"/a/b/file.txt",
            is_dir: false,
            size: 7,
            created_unix_ns: 1,
            modified_unix_ns: 2,
        })
        .unwrap();
    builder
        .add_entry(InputEntry {
            path: b"/a/b",
            is_dir: true,
            size: 99,
            created_unix_ns: 3,
            modified_unix_ns: 4,
        })
        .unwrap();

    let db = Db::from_bytes(builder.build_bytes().unwrap()).unwrap();
    let dir = db.lookup_path(b"/a/b").unwrap();
    let dir_record = db.get(dir).unwrap();

    assert!(dir_record.is_dir);
    assert!(dir_record.is_explicit);
    assert_eq!(dir_record.size, 99);
    assert_eq!(dir_record.created_unix_ns, 3);

    let parent = db.lookup_path(b"/a").unwrap();
    assert!(!db.get(parent).unwrap().is_explicit);
    assert_eq!(db.stats().explicit_dirs, 2);
    assert_eq!(db.stats().explicit_files, 1);
}

#[test]
fn children_are_sorted_and_lookup_child_is_fast() {
    let mut builder = DbBuilder::new();
    for name in [b"charlie".as_slice(), b"alpha", b"bravo"] {
        let mut path = b"/root/".to_vec();
        path.extend_from_slice(name);
        builder
            .add_entry(InputEntry {
                path: &path,
                is_dir: false,
                size: 1,
                created_unix_ns: 0,
                modified_unix_ns: 0,
            })
            .unwrap();
    }

    let db = Db::from_bytes(builder.build_bytes().unwrap()).unwrap();
    let root = db.lookup_path(b"/root").unwrap();
    let child_names: Vec<Vec<u8>> = db
        .children(root)
        .unwrap()
        .iter()
        .map(|id| db.get(*id).unwrap().name.to_vec())
        .collect();

    assert_eq!(
        child_names,
        vec![b"alpha".to_vec(), b"bravo".to_vec(), b"charlie".to_vec()]
    );
    let bravo = db.lookup_child(root, b"bravo").unwrap();
    assert_eq!(db.get(bravo).unwrap().name, b"bravo");
}

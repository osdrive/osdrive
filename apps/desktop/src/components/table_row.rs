use std::rc::Rc;

use gpui::{prelude::FluentBuilder, *};
use human_bytes::human_bytes;

use crate::{permissions, state::{Node, NodeKind, State}};

#[derive(IntoElement)]
pub struct TableRow {
    ix: usize,
    node: Rc<Node>,
    selected: bool,
    on_click: Option<Box<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>>,
}

impl TableRow {
    pub fn new(ix: usize, node: Rc<Node>, selected: bool) -> Self {
        Self {
            ix,
            node,
            selected,
            on_click: None,
        }
    }

    pub fn on_click(mut self, f: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Box::new(f));
        self
    }

    fn render_cell(&self, key: &str, width: DefiniteLength, _: &mut App) -> Div {
        let meta_color: Hsla = if self.selected {
            rgba(0xFFFFFFAA).into()
        } else {
            rgb(0x8E8E93).into()
        };

        let content: Div = match key {
            "name" => div()
                .flex()
                .items_center()
                .gap_2()
                .child(file_icon(self.node.kind, &self.node.name))
                .child(self.node.name.to_string_lossy().to_string()),
            "size" => div().text_color(meta_color).child(match self.node.kind {
                NodeKind::File => human_bytes(self.node.size as f64),
                _ => "—".to_string(),
            }),
            "modified" => div()
                .text_color(meta_color)
                .child(self.node.modified.format("%b %d, %Y").to_string()),
            _ => div().child("—"),
        };

        div()
            .whitespace_nowrap()
            .truncate()
            .w(width)
            .px_2()
            .child(content)
    }
}

fn file_icon(kind: NodeKind, name: &std::ffi::OsStr) -> Div {
    let ext = std::path::Path::new(name)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let (bg_color, icon_svg): (Rgba, &'static str) = match kind {
        NodeKind::Directory => (
            rgb(0xFF9F0A),
            include_str!("../../icons/PhFolder.svg"),
        ),
        NodeKind::File => {
            let color = match ext.as_str() {
                "jpg" | "jpeg" | "png" | "gif" | "svg" | "webp" | "heic" | "bmp" | "tiff" => {
                    rgb(0xBF5AF2)
                }
                "mp4" | "mov" | "avi" | "mkv" | "m4v" | "webm" => rgb(0xFF453A),
                "mp3" | "m4a" | "flac" | "wav" | "aac" | "ogg" => rgb(0xFF9F0A),
                "js" | "ts" | "jsx" | "tsx" | "py" | "rs" | "go" | "rb" | "swift" | "kt"
                | "java" | "c" | "cpp" | "h" | "cs" | "php" | "sh" => rgb(0x30D158),
                "pdf" => rgb(0xFF453A),
                "doc" | "docx" | "txt" | "md" | "rtf" => rgb(0x0A84FF),
                "xls" | "xlsx" | "csv" => rgb(0x30D158),
                "ppt" | "pptx" => rgb(0xFF6430),
                "zip" | "tar" | "gz" | "bz2" | "dmg" | "pkg" | "rar" | "7z" => rgb(0x8E8E93),
                "json" | "yaml" | "yml" | "toml" | "xml" => rgb(0x5E5CE6),
                "html" | "css" | "scss" | "less" => rgb(0xFF6430),
                _ => rgb(0x636366),
            };
            (color, include_str!("../../icons/PhFile.svg"))
        }
        NodeKind::Unknown => (rgb(0x8E8E93), include_str!("../../icons/PhFile.svg")),
    };

    div()
        .flex_none()
        .p(px(4.))
        .rounded_sm()
        .bg(bg_color)
        .flex()
        .items_center()
        .justify_center()
        .child(
            img(ImageSource::Resource(Resource::Embedded(
                SharedString::new_static(icon_svg),
            )))
            .size_4()
            .text_color(white()),
        )
}

pub const FIELDS: [(&str, f32); 3] = [
    ("name", 0.62),
    ("size", 0.14),
    ("modified", 0.24),
];

impl RenderOnce for TableRow {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .id(self.ix)
            .flex()
            .flex_row()
            .items_center()
            .border_b_1()
            .border_color(rgb(0xF2F2F7))
            .bg(if self.selected {
                rgb(0x0071E3)
            } else {
                rgb(0xFFFFFF)
            })
            .text_color(if self.selected {
                rgb(0xFFFFFF)
            } else {
                rgb(0x1C1C1E)
            })
            .py_2()
            .px_3()
            .w_full()
            .when(!self.selected, |this| {
                this.hover(|d| d.bg(rgb(0xF5F5FA)))
            })
            .children(FIELDS.map(|(key, width)| self.render_cell(key, relative(width), cx)))
            .when_some(self.on_click, move |this, on_click| {
                this.cursor_pointer().on_click(on_click)
            })
    }
}

pub fn open_node(state: &Entity<State>, cx: &mut App, node: &Node, force: bool) {
    match node.kind {
        NodeKind::Directory if !force => {
            let path = node.path.clone();
            state.update(cx, move |state: &mut State, cx| state.set_path(cx, path));
        }
        NodeKind::File | NodeKind::Directory => {
            let _ = permissions::open_path(&node.path);
        }
        NodeKind::Unknown => {}
    }
}

pub fn render_titles() -> impl IntoElement {
    div()
        .flex()
        .flex_row()
        .items_center()
        .w_full()
        .overflow_hidden()
        .border_b_1()
        .border_color(rgb(0xE5E5EA))
        .text_color(rgb(0x8E8E93))
        .bg(rgb(0xFAFAFA))
        .py_1p5()
        .px_3()
        .text_xs()
        .font_weight(FontWeight::SEMIBOLD)
        .children(FIELDS.map(|(key, width)| {
            div()
                .whitespace_nowrap()
                .flex_shrink_0()
                .truncate()
                .px_2()
                .w(relative(width))
                .child(key.replace('_', " ").to_uppercase())
        }))
}

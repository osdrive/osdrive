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
            rgba(0xFFFFFF99).into()
        } else {
            rgb(0x86868B).into()
        };

        let content: Div = match key {
            "name" => {
                let icon_svg: &'static str = match self.node.kind {
                    NodeKind::Directory => include_str!("../../icons/PhFolder.svg"),
                    _ => include_str!("../../icons/PhFile.svg"),
                };
                div()
                    .flex()
                    .items_center()
                    .gap_2()
                    .child(
                        img(ImageSource::Resource(Resource::Embedded(
                            SharedString::new_static(icon_svg),
                        )))
                        .size_4(),
                    )
                    .child(self.node.name.to_string_lossy().to_string())
            }
            "kind" => div().text_color(meta_color).child(match self.node.kind {
                NodeKind::Directory => "Folder",
                NodeKind::File => "File",
                NodeKind::Unknown => "—",
            }),
            "size" => div().text_color(meta_color).child(match self.node.kind {
                NodeKind::File => human_bytes(self.node.size as f64),
                _ => "—".to_string(),
            }),
            "created" => div()
                .text_color(meta_color)
                .child(self.node.created.format("%b %d, %Y").to_string()),
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

pub const FIELDS: [(&str, f32); 5] = [
    ("name", 0.55),
    ("kind", 0.08),
    ("size", 0.10),
    ("created", 0.135),
    ("modified", 0.135),
];

impl RenderOnce for TableRow {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .id(self.ix)
            .flex()
            .flex_row()
            .items_center()
            .border_b_1()
            .border_color(rgb(0xE5E5EA))
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
            .py_1p5()
            .px_2()
            .w_full()
            .when(!self.selected, |this| {
                this.hover(|d| d.bg(rgb(0xF0F0F5)))
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
        .text_color(rgb(0x86868B))
        .bg(rgb(0xF7F7F7))
        .py_1p5()
        .px_2()
        .text_xs()
        .children(FIELDS.map(|(key, width)| {
            div()
                .whitespace_nowrap()
                .flex_shrink_0()
                .truncate()
                .px_2()
                .w(relative(width))
                .child(key.replace("_", " ").to_uppercase())
        }))
}

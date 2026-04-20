use std::path::PathBuf;

use gpui::*;

use crate::state::State;

pub struct Sidebar {
    state: Entity<State>,
}

impl Sidebar {
    pub fn new(cx: &mut Context<Self>, state: Entity<State>) -> Self {
        cx.observe(&state, |_, _, cx| cx.notify()).detach();
        Self { state }
    }
}

impl Render for Sidebar {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let current = self.state.read(cx).path().to_path_buf();
        let state = self.state.clone();

        let home = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_default();

        let places: Vec<(&'static str, PathBuf)> = vec![
            ("Home", home.clone()),
            ("Desktop", home.join("Desktop")),
            ("Documents", home.join("Documents")),
            ("Downloads", home.join("Downloads")),
        ];

        div()
            .w(px(176.))
            .h_full()
            .flex_none()
            .bg(rgb(0xECECF1))
            .border_r_1()
            .border_color(rgb(0xD1D1D6))
            .flex()
            .flex_col()
            .pt_6()
            .pb_4()
            .child(
                div()
                    .px_4()
                    .pb_2()
                    .text_xs()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(rgb(0x9898A0))
                    .child("FAVORITES"),
            )
            .children(places.into_iter().map(|(label, path)| {
                let is_active = current == path;
                let state = state.clone();
                let path_for_click = path.clone();

                let active_blue: Rgba = rgb(0x0071E3);
                let transparent: Rgba = rgba(0x00000000);
                let hover_tint: Rgba = rgba(0x00000012);

                let folder_icon = img(ImageSource::Resource(Resource::Embedded(
                    SharedString::new_static(include_str!("../../icons/PhFolder.svg")),
                )))
                .size_4()
                .text_color(if is_active {
                    rgb(0xFFFFFF)
                } else {
                    rgb(0x86868B)
                });

                div()
                    .id(SharedString::from(label))
                    .flex()
                    .items_center()
                    .gap_2()
                    .px_3()
                    .py_1p5()
                    .mx_2()
                    .rounded_sm()
                    .cursor_pointer()
                    .bg(if is_active { active_blue } else { transparent })
                    .hover(move |d| {
                        d.bg(if is_active { active_blue } else { hover_tint })
                    })
                    .text_color(if is_active {
                        rgb(0xFFFFFF)
                    } else {
                        rgb(0x3A3A3C)
                    })
                    .text_sm()
                    .child(folder_icon)
                    .child(label)
                    .on_click(move |_, _, cx| {
                        state.update(cx, |s, cx| s.set_path(cx, path_for_click.clone()));
                    })
            }))
    }
}

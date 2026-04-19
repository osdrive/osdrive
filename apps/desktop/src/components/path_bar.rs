use std::path::PathBuf;

use gpui::*;

use crate::{
    components::TextInput,
    state::{PathChange, State},
};

use super::{button, button2};

pub struct PathBar {
    state: Entity<State>,
    text_input: Entity<TextInput>,
}

impl PathBar {
    pub fn init(cx: &mut Context<Self>, state: Entity<State>) -> Self {
        let text_input = cx.new(|cx: &mut Context<TextInput>| {
            cx.subscribe(&state, |subscriber, emitter, _: &PathChange, cx| {
                subscriber.content =
                    SharedString::new(emitter.read(cx).path().to_str().unwrap().to_string());
            })
            .detach();

            TextInput {
                focus_handle: cx.focus_handle(),
                content: SharedString::new(state.read(cx).path().to_str().unwrap().to_string()),
                placeholder: "Type here...".into(),
                selected_range: 0..0,
                selection_reversed: false,
                marked_range: None,
                last_layout: None,
                last_bounds: None,
                is_selecting: false,
            }
        });

        Self { state, text_input }
    }
}

impl Render for PathBar {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .flex()
            .items_center()
            .gap_2()
            .bg(rgb(0xF2F2F7))
            .border_b_1()
            .border_color(rgb(0xD1D1D6))
            .px_3()
            .py_2()
            // Navigation buttons
            .child(
                div()
                    .flex()
                    .items_center()
                    .gap_1()
                    .flex_none()
                    .child(button2("←", !self.state.read(cx).can_go_back(), {
                        let state = self.state.clone();
                        move |_, cx| {
                            state.update(cx, |state, cx| state.go_back(cx));
                        }
                    }))
                    .child(button2("→", !self.state.read(cx).can_go_forward(), {
                        let state = self.state.clone();
                        move |_, cx| {
                            state.update(cx, |state, cx| state.go_forward(cx));
                        }
                    }))
                    .child(button2("↑", !self.state.read(cx).can_go_up(), {
                        let state = self.state.clone();
                        move |_, cx| {
                            state.update(cx, |state, cx| state.go_up(cx));
                        }
                    })),
            )
            // Divider
            .child(
                div()
                    .w(px(1.))
                    .h(px(18.))
                    .bg(rgb(0xC5C5C7))
                    .flex_none(),
            )
            // Path input
            .child(
                div()
                    .flex_1()
                    .bg(rgb(0xFFFFFF))
                    .border_1()
                    .border_color(rgb(0xD1D1D6))
                    .rounded_sm()
                    .px_2()
                    .child(self.text_input.clone()),
            )
            .child(button("Go", {
                let state = self.state.clone();
                let text_input = self.text_input.clone();
                move |_, cx| {
                    let path = PathBuf::from(text_input.read(cx).content.to_string());
                    state.update(cx, |state, cx| state.set_path(cx, path));
                }
            }))
    }
}

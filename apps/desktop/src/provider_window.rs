use gpui::*;

use crate::{components::button, file_provider, window::CloseWindow};

pub struct ProviderWindow {
    status: SharedString,
}

impl ProviderWindow {
    pub fn init() -> Self {
        Self {
            status: file_provider::refresh_status_message().into(),
        }
    }

    fn set_status(&mut self, status: String) {
        self.status = status.into();
    }
}

impl Render for ProviderWindow {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let view = cx.entity().clone();

        div()
            .on_action(|_: &CloseWindow, window, _| window.remove_window())
            .font_family(".SystemUIFont")
            .bg(rgb(0xffffff))
            .text_color(rgb(0x0))
            .size_full()
            .p_4()
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap_4()
                    .size_full()
                    .child(
                        div()
                            .text_xl()
                            .font_weight(FontWeight::BOLD)
                            .child("Hello World File Provider"),
                    )
                    .child(
                        div()
                            .text_sm()
                            .text_color(rgb(0x666666))
                            .child(self.status.clone()),
                    )
                    .child(
                        div()
                            .flex()
                            .gap_2()
                            .child(button("Register with macOS", {
                                let view = view.clone();
                                move |_, cx| {
                                    view.update(cx, |this, cx| {
                                        this.set_status(file_provider::register_status_message());
                                        cx.notify();
                                    });
                                }
                            }))
                            .child(button("Remove Domain", {
                                move |_, cx| {
                                    view.update(cx, |this, cx| {
                                        this.set_status(file_provider::unregister_status_message());
                                        cx.notify();
                                    });
                                }
                            })),
                    ),
            )
    }
}

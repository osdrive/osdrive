use gpui::*;

use crate::{
    components::{button, button2},
    file_provider,
    index::{self, IndexStats},
    window::CloseWindow,
};

enum IndexState {
    Idle,
    Running,
    Complete(IndexStats),
    Failed(SharedString),
}

pub struct ProviderWindow {
    status: SharedString,
    index_state: IndexState,
}

impl ProviderWindow {
    pub fn init() -> Self {
        Self {
            status: file_provider::refresh_status_message().into(),
            index_state: IndexState::Idle,
        }
    }

    fn set_status(&mut self, status: String) {
        self.status = status.into();
    }

    fn start_indexing(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        if matches!(self.index_state, IndexState::Running) {
            return;
        }

        self.index_state = IndexState::Running;
        let view = cx.entity().downgrade();

        window
            .spawn(cx, async move |cx| {
                let result = cx
                    .background_executor()
                    .spawn(async move { index::index_default_volume() })
                    .await;

                let _ = view.update(cx, |this, cx| {
                    this.index_state = match result {
                        Ok(stats) => IndexState::Complete(stats),
                        Err(error) => {
                            IndexState::Failed(format!("Indexing failed: {error}").into())
                        }
                    };
                    cx.notify();
                });
            })
            .detach();

        cx.notify();
    }

    fn index_status_message(&self) -> SharedString {
        match &self.index_state {
            IndexState::Idle => "Ready to build the index.".into(),
            IndexState::Running => "Indexing the filesystem...".into(),
            IndexState::Complete(_) => "Indexing complete.".into(),
            IndexState::Failed(message) => message.clone(),
        }
    }

    fn render_stats(&self) -> Option<Div> {
        let IndexState::Complete(stats) = &self.index_state else {
            return None;
        };

        Some(
            div()
                .flex()
                .flex_col()
                .gap_1()
                .text_sm()
                .child(format!("Directories: {}", stats.dirs))
                .child(format!("Files: {}", stats.files))
                .child(format!("Persisted entries: {}", stats.persisted))
                .child(format!("Nodes: {}", stats.nodes))
                .child(format!("Index time: {:.2?}", stats.index_took))
                .child(format!("Stats time: {:.2?}", stats.stats_took)),
        )
    }
}

impl Render for ProviderWindow {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let view = cx.entity().clone();
        let mut content = div()
            .flex()
            .flex_col()
            .gap_4()
            .size_full()
            .child(
                div()
                    .text_xl()
                    .font_weight(FontWeight::BOLD)
                    .child("OSDrive File Provider"),
            )
            .child(
                div()
                    .text_sm()
                    .text_color(rgb(0x666666))
                    .child(self.status.clone()),
            )
            .child(
                div()
                    .text_sm()
                    .text_color(rgb(0x444444))
                    .child(self.index_status_message()),
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
                    .child(button("Enable Share Extension", {
                        let view = view.clone();
                        move |_, cx| {
                            view.update(cx, |this, cx| {
                                this.set_status(file_provider::open_share_extension_settings_message());
                                cx.notify();
                            });
                        }
                    }))
                    .child(button2(
                        match self.index_state {
                            IndexState::Running => "Indexing...",
                            _ => "Build Index",
                        },
                        matches!(self.index_state, IndexState::Running),
                        {
                            let view = view.clone();
                            move |window, cx| {
                                view.update(cx, |this, cx| {
                                    this.start_indexing(window, cx);
                                });
                            }
                        },
                    ))
                    .child(button("Remove Domain", {
                        move |_, cx| {
                            view.update(cx, |this, cx| {
                                this.set_status(file_provider::unregister_status_message());
                                cx.notify();
                            });
                        }
                    })),
            );

        if let Some(stats) = self.render_stats() {
            content = content.child(stats);
        }

        div()
            .on_action(|_: &CloseWindow, window, _| window.remove_window())
            .font_family(".SystemUIFont")
            .bg(rgb(0xffffff))
            .text_color(rgb(0x0))
            .size_full()
            .p_4()
            .child(content)
    }
}

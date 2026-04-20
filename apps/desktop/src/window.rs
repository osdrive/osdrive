use gpui::*;

use crate::{
    components::{DataTable, PathBar, QuickPreview, Sidebar, StatusBar, open_node},
    state::State,
};

actions!(example, [CloseWindow]);

pub struct MainWindow {
    state: Entity<State>,
    path_bar: Entity<PathBar>,
    data_table: Entity<DataTable>,
    sidebar: Entity<Sidebar>,
    status_bar: Entity<StatusBar>,
    quick_preview: Entity<QuickPreview>,
    focus: FocusHandle,
}

impl MainWindow {
    pub fn init(cx: &mut Context<Self>, window: &mut Window) -> Self {
        let focus = cx.focus_handle();
        focus.focus(window);

        let state = cx.new(|_| State::init());
        Self {
            path_bar: cx.new(|cx| PathBar::init(cx, state.clone())),
            data_table: cx.new(|_| DataTable::new(state.clone())),
            sidebar: cx.new(|cx| Sidebar::new(cx, state.clone())),
            status_bar: cx.new(|cx| StatusBar::new(cx, state.clone())),
            quick_preview: cx.new(|cx| {
                cx.observe(&state, |quick_preview: &mut QuickPreview, state, cx| {
                    let state = state.read(cx);
                    quick_preview
                        .set(state.selected().and_then(|s| state.nodes().get(s)).cloned());
                })
                .detach();
                QuickPreview::init()
            }),
            state,
            focus,
        }
    }
}

impl Render for MainWindow {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        div()
            .on_key_down({
                let state = self.state.clone();
                let preview = self.quick_preview.clone();

                move |event, _, cx| {
                    let modifier =
                        event.keystroke.modifiers.platform || event.keystroke.modifiers.shift;

                    match &*event.keystroke.key {
                        "[" if modifier => {
                            state.update(cx, |state, cx| state.go_back(cx));
                        }
                        "]" if modifier => {
                            state.update(cx, |state, cx| state.go_forward(cx));
                        }
                        "up" if modifier => {
                            state.update(cx, |state, cx| state.go_up(cx));
                        }
                        "down" if modifier => {
                            let s = state.read(cx);
                            if let Some(selection) = s.selected() {
                                let node = s.nodes().get(selection).unwrap().clone();
                                open_node(&state, cx, &node, false);
                            }
                        }
                        "o" if modifier => {
                            let s = state.read(cx);
                            if let Some(selection) = s.selected() {
                                let node = s.nodes().get(selection).unwrap().clone();
                                open_node(&state, cx, &node, true);
                            }
                        }
                        "up" => {
                            state.update(cx, |state, cx| state.back_selected(cx));
                        }
                        "down" => {
                            state.update(cx, |state, cx| state.next_selected(cx));
                        }
                        "escape" => {
                            state.update(cx, |state, cx| state.clear_selection(cx));
                        }
                        "enter" => {
                            let s = state.read(cx);
                            if let Some(selection) = s.selected() {
                                let node = s.nodes().get(selection).unwrap().clone();
                                open_node(&state, cx, &node, true);
                            }
                        }
                        "space" => {
                            preview.update(cx, |s, cx| {
                                s.toggle();
                                cx.notify();
                            });
                        }
                        _ => {}
                    }
                }
            })
            .font_family(".SystemUIFont")
            .on_action(|_: &CloseWindow, window, _| window.remove_window())
            .track_focus(&self.focus)
            .relative()
            .size_full()
            .bg(rgb(0xFFFFFF))
            .child(
                div()
                    .absolute()
                    .inset_0()
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .size_full()
                            .child(self.sidebar.clone())
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .flex_1()
                                    .overflow_hidden()
                                    .child(self.path_bar.clone())
                                    .child(self.data_table.clone())
                                    .child(self.status_bar.clone()),
                            ),
                    ),
            )
            .child(self.quick_preview.clone())
    }
}

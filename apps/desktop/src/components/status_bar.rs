use gpui::*;

use crate::state::State;

pub struct StatusBar {
    state: Entity<State>,
}

impl StatusBar {
    pub fn new(cx: &mut Context<Self>, state: Entity<State>) -> Self {
        cx.observe(&state, |_, _, cx| cx.notify()).detach();
        Self { state }
    }
}

impl Render for StatusBar {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let state = self.state.read(cx);
        let count = state.nodes().len();
        let selected_name = state
            .selected()
            .and_then(|i| state.nodes().get(i))
            .map(|n| n.name.to_string_lossy().to_string());

        let label = match selected_name {
            Some(name) => format!("\"{}\" selected  ·  {} items", name, count),
            None => format!("{} item{}", count, if count == 1 { "" } else { "s" }),
        };

        div()
            .flex()
            .items_center()
            .justify_center()
            .px_4()
            .py_1p5()
            .bg(rgb(0xF2F2F7))
            .border_t_1()
            .border_color(rgb(0xD1D1D6))
            .text_xs()
            .text_color(rgb(0x8E8E93))
            .child(label)
    }
}

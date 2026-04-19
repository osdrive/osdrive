use gpui::*;

pub fn button(text: &str, on_click: impl Fn(&mut Window, &mut App) + 'static) -> Stateful<Div> {
    button2(text, false, on_click)
}

pub fn button2(
    text: &str,
    disabled: bool,
    on_click: impl Fn(&mut Window, &mut App) + 'static,
) -> Stateful<Div> {
    let mut b = div()
        .id(SharedString::from(text.to_string()))
        .flex_none()
        .px_3()
        .py_1()
        .bg(rgb(0xFFFFFF))
        .hover(|this| this.bg(rgb(0xE8E8ED)))
        .active(|this| this.bg(rgb(0xD8D8DD)))
        .border_1()
        .border_color(rgb(0xC5C5C7))
        .rounded_sm()
        .cursor_pointer()
        .text_color(rgb(0x1C1C1E))
        .text_sm()
        .child(text.to_string())
        .on_click(move |_, window, cx| on_click(window, cx));

    if disabled {
        b = b.opacity(0.35).cursor_not_allowed();
    }

    b
}

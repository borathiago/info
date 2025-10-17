export const getContainer = (): Document | ShadowRoot => {
    const shadow = document.querySelector('#infographic-shadow-container')?.shadowRoot
    if (shadow) {
        return shadow
    }
    return document
}
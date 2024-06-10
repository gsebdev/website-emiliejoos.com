import Quill from 'quill';

const Embed = Quill.import('blots/block/embed');

class CustomImageBlot extends Embed {
    static blotName = 'customImage';
    static tagName = 'img';
    static className = 'custom-class';

    static create(value: any) {
        const node = super.create(value) as HTMLElement;
        console.log(value);
        node.setAttribute('src', value.src);
        node.setAttribute('height', value.height);
        node.setAttribute('width', value.width);
        node.setAttribute('srcset', value.src);
        if (value.alt) {
            node.setAttribute('alt', value.alt);
        }
        return node;
    }

    static value(node: HTMLElement) {
        return {
            url: node.getAttribute('src'),
            alt: node.getAttribute('alt'),
        };
    }
}

Quill.register(CustomImageBlot as any);

export default CustomImageBlot;

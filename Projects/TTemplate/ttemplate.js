const TEMPLATE_PREFIX = "T-";
const MAX_TRIES = 10;

function generate() {
    // Get templates
    templates = document.getElementsByTagName("template");
    ttemplates = [];
    for (template of templates) {
        var name = template.id;
        if (name.startsWith(TEMPLATE_PREFIX)) {
            ttemplates.push(template);
        }
    }

    // Generate templates
    // Repeat until none can be found
    // TODO: this needs a way to limit recursion
    let createdElements = true;
    for (let i = 0; i < MAX_TRIES; i++) {
        if (!createdElements) {break;}
        for (const template of ttemplates) {
            elements = [];
            for (const element of document.getElementsByTagName(template.id.toLowerCase())) {
                elements.push(element);
            }
            createdElements = false;
            for (const element of elements) {
                createdElements = true;
                let attributes = element.attributes;
                let newHTML = template.innerHTML;
                for (attribute of attributes) {
                    name = "{" + attribute.name.toUpperCase() + "}";
                    value = attribute.nodeValue;
                    newHTML = newHTML.replaceAll(name, value);
                }
                newHTML = newHTML.replaceAll("{INNER_HTML}", element.innerHTML);
                element.outerHTML = newHTML;
                element.remove();
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", generate);
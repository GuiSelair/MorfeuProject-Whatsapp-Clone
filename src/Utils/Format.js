
class Format {

    static getCamelCase(elementID){
        // MÉTODO RESPONSAVEL POR FORMATAR O ID DOS ELEMENTOS DO
        // FORMATO DASH-CASE (btn-send) PRA CAMELCASE (btnSend)

        const div = document.createElement("div");
        div.innerHTML = `<div data-${elementID}="id"></div;`;
        return Object.keys(div.firstChild.dataset)[0];
    }
}
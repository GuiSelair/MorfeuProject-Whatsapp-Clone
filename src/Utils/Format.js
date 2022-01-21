
class Format {

    static getCamelCase(elementID){
        // MÉTODO RESPONSAVEL POR FORMATAR O ID DOS ELEMENTOS DO
        // FORMATO DASH-CASE (btn-send) PRA CAMELCASE (btnSend)

        const div = document.createElement("div");
        div.innerHTML = `<div data-${elementID}="id"></div;`;
        return Object.keys(div.firstChild.dataset)[0];
    }

    static toTime(duration){
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);
        let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }

    }
}
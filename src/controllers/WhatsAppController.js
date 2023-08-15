
import { Format } from '../utils/Format'
import { CameraController } from './CameraController'
import { DocumentPreviewController } from './DocumentPreviewController'
import { MicrophoneController } from './MicrophoneController'
import { Datasource } from '../providers/Datasource'
import { LocalStorage } from '../providers/Localstorage'
import { User } from '../entities/User'

export class WhatsAppController {

    constructor() {
        window.datasource = new Datasource(new LocalStorage("@morfeu-whatsapp"));
        this.elementsPrototype();
        this.loadElements();
        this.initEvents();
        this.initUserInfos()
        console.log("\n=== CONFIGURAÇÃO INICIAL FINALIZADA ===")
    }

    initEvents() {
        // UNS DOS MÉTOOS PRINCIPAIS RESPONSAVEL PELA INSTANCIA DE 
        // EVENTOS EM DIVERSOS ELEMENTOS.
        this.el.myPhoto.on("click", event => {
            this.closeAllLeftPanel()
            this.el.panelEditProfile.show()
            setTimeout(() => {
                this.el.panelEditProfile.addClass("open")
            }, 300)
        })

        this.el.btnNewContact.on("click", event => {
            this.closeAllLeftPanel()
            this.el.panelAddContact.show()
            setTimeout(() => {
                this.el.panelAddContact.addClass("open")
            }, 300)
        })

        this.el.btnClosePanelEditProfile.on("click", event => {
            this.el.panelEditProfile.removeClass("open")
        })

        this.el.btnClosePanelAddContact.on("click", event => {
            this.el.panelAddContact.removeClass("open")
        })

        this.el.photoContainerEditProfile.on("click", event => {
            this.el.inputProfilePhoto.click();
        })

        this.el.inputNamePanelEditProfile.on("keypress", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                this.el.btnSavePanelEditProfile.click()
            }
        })

        this.el.btnSavePanelEditProfile.on("click", event => {
            console.log(this.el.inputNamePanelEditProfile.innerHTML);
        })

        this.el.formPanelAddContact.on("submit", event => {
            event.preventDefault();
            console.log(this.el.formPanelAddContact.toJSON())
            this.el.formPanelAddContact.reset();
        })

        this.el.contactsMessagesList.querySelectorAll(".contact-item").forEach(message => {
            message.on("click", () => {
                this.el.home.hide()
                this.el.main.css({
                    display: 'flex'
                })
            })
        })

        this.el.btnAttach.on("click", (event) => {
            event.stopPropagation()
            this.el.menuAttach.addClass("open")
            document.addEventListener("click", this.closeMenuAttach.bind(this))
        })

        this.el.btnAttachPhoto.on("click", () => {
            this.el.inputPhoto.click();
        })

        this.el.inputPhoto.on("change", () => {
            [...this.el.inputPhoto.files].forEach(file => {
                console.log(file);
            });
        });

        this.el.btnAttachCamera.on("click", () => {
            this.el.panelMessagesContainer.hide();
            this.el.panelCamera.addClass("open");
            this.el.panelCamera.css({
                "height": "calc(100% - 120px)"
            });
            this.el.pictureCamera.hide();
            this.el.videoCamera.show();
            this._camera = new CameraController(this.el.videoCamera);
        });

        this.el.btnClosePanelCamera.on("click", () => {
            this.closeAllMainPanel();
            this.el.panelMessagesContainer.show();
            this._camera.stop()
        });

        this.el.btnTakePicture.on("click", () => {
            const pictureUrl = this._camera.takePicture()
            this.el.pictureCamera.src = pictureUrl;
            this.el.pictureCamera.show();
            this.el.videoCamera.hide();
            this.el.btnReshootPanelCamera.show();
            this.el.containerTakePicture.hide();
            this.el.containerSendPicture.show();
        });

        this.el.btnReshootPanelCamera.on("click", () => {
            this.el.pictureCamera.hide();
            this.el.videoCamera.show();
            this.el.btnReshootPanelCamera.hide();
            this.el.containerTakePicture.show();
            this.el.containerSendPicture.hide();
        });

        this.el.btnAttachDocument.on("click", () => {
            this.closeAllMainPanel();
            this.el.panelDocumentPreview.addClass("open");
            this.el.panelDocumentPreview.css({
                "height": "calc(100% - 120px)"
            });
            this.el.inputDocument.click()
        });

        this.el.btnClosePanelDocumentPreview.on("click", () => {
            this.closeAllMainPanel();
            this.el.panelMessagesContainer.show();
        });

        this.el.btnSendDocument.on("click", () => {
            console.log("send document");
        });

        this.el.btnAttachContact.on("click", () => {
            this.el.modalContacts.show();
        });

        this.el.btnCloseModalContacts.on("click", () => {
            this.el.modalContacts.hide();
        });

        this.el.btnSendMicrophone.on("click", () => {
            this.el.btnSendMicrophone.hide();
            this.el.recordMicrophone.show();

            this._microphoneController = new MicrophoneController();
            this._microphoneController.on("ready", (audio) => {
                console.log(audio);
                this._microphoneController.startRecorder();
            })

            this._microphoneController.on("recordtimer", (timer) => {
                this.el.recordMicrophoneTimer.innerHTML = Format.toTime(timer);
            })

        });

        this.el.btnCancelMicrophone.on("click", () => {
            this._microphoneController.stopRecorder();
           this.closeRecordMicrophone();
        });

        this.el.btnFinishMicrophone.on("click", () => {
            this._microphoneController.stopRecorder();
            this.closeRecordMicrophone();
        });

        this.el.inputText.on("keyup", () => {
            if (this.el.inputText.innerHTML.length) {
                this.el.inputPlaceholder.hide();
                this.el.btnSendMicrophone.hide();
                this.el.btnSend.show();
            } else {
                this.el.inputPlaceholder.show();
                this.el.btnSendMicrophone.show();
                this.el.btnSend.hide();
            }
        });

        this.el.inputText.on("keypress", (event) => {
            if (event.key === "Enter" && !event.ctrlKey) {
                event.preventDefault();
                this.el.btnSend.click();
            }
        });

        this.el.btnSend.on("click", () => {
            console.log(this.el.inputText.innerHTML);
        });

        this.el.btnEmojis.on("click", () => {
            this.el.panelEmojis.toggleClass("open");
        });

        this.el.panelEmojis.querySelectorAll(".emojik").forEach((emoji) => {
            emoji.on("click", (event) => {
                console.log(event.target);
                const img = this.el.imgEmojiDefault.cloneNode();
                img.style.cssText = emoji.style.cssText;
                img.dataset.unicode = emoji.dataset.unicode;
                img.alt = emoji.dataset.unicode;

                emoji.classList.forEach(name => {
                    img.classList.add(name);
                });

                
                let cursor = window.getSelection();
                
                if (!cursor.focusNode || !cursor.focusNode.id === 'input-text') {
                    this.el.inputText.focus();
                    cursor = window.getSelection();
                }
                
                let range = document.createRange();
                range = cursor.getRangeAt(0);

                range.deleteContents();

                const fragment = document.createDocumentFragment();
                fragment.appendChild(img);

                range.insertNode(fragment);
                range.setStartAfter(img);

                
                this.el.inputText.dispatchEvent(new Event("keyup"));
            });
        });

        this.el.inputDocument.on("change", () => {
            console.log('this.el.inputDocument.files', this.el.inputDocument.files.length)
            if (this.el.inputDocument.files.length) {
                this.el.panelDocumentPreview.css({
                    "height": "1%"
                });
                const file = this.el.inputDocument.files[0];
                const _documentPreviewController = new DocumentPreviewController(file);

                _documentPreviewController.getPreviewData().then((preview) => {
                    this.el.panelDocumentPreview.css({
                        "height": "calc(100% - 120px)"
                    });
                    this.el.imgPanelDocumentPreview.src = preview.src; // tag img do preview
                    this.el.imgPanelDocumentPreview.style.width = '100%'
                    this.el.infoPanelDocumentPreview.innerHTML = preview.info; // tag div do nome do preview
                    
                    this.el.imagePanelDocumentPreview.show();
                    this.el.filePanelDocumentPreview.hide();
                }).catch(() => {
                    switch (file.type) {
                        case 'application/vnd.ms-excel':
                        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                            this.el.iconPanelDocumentPreview.className = "jcxhw icon-doc-xls";
                            break;
                        case 'application/vnd.ms-powerpoint':
                        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                            this.el.iconPanelDocumentPreview.className = "jcxhw icon-doc-ppt";
                            break;
                        case 'application/vnd.ms-word':
                        case 'application/vnd.msword':
                        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            this.el.iconPanelDocumentPreview.className = "jcxhw icon-doc-doc";
                            break;
                        default:
                            this.el.iconPanelDocumentPreview.className = "jcxhw icon-doc-generic";
                            break;
                    }

                    this.el.filenamePanelDocumentPreview.innerHTML = file.name;
                    this.el.filePanelDocumentPreview.show();
                    this.el.imagePanelDocumentPreview.hide();
                    this.el.panelDocumentPreview.css({
                        "height": "calc(100% - 120px)"
                    });
                })

               

            }
        })
    }

    initUserInfos() {
        this._user = new User('contato@guilhermeselair.dev')

        this._user.on("datachange", data => {
            console.log('data', data)
            document.querySelector('title').innerHTML = data.name + ' - WhatsApp Clone'

            if (data.photo) {
                const profilePhoto = this.el.imgPanelEditProfile;
                profilePhoto.src = data.photo;
                profilePhoto.show()
                this.el.imgDefaultPanelEditProfile.hide()

                this.el.myPhoto.querySelector('img').src = data.photo;
                this.el.myPhoto.querySelector('img').show()
            }

            this.el.inputNamePanelEditProfile.innerHTML = data.name;
        })
    }

    closeRecordMicrophone() {
        this.el.recordMicrophone.hide();
        this.el.btnSendMicrophone.show();
    }

    closeAllMainPanel() {
        this.el.panelMessagesContainer.hide();
        this.el.panelDocumentPreview.removeClass("open");
        this.el.panelCamera.removeClass("open");
    }

    closeMenuAttach(event) {
        document.removeEventListener("click", this.closeAllLeftPanel)
        this.el.menuAttach.removeClass("open")
    }

    closeAllLeftPanel() {
        // MÉTODO RESPONSAVEL POR FECHAR TODOS OS PAINEIS LATERAIS
        // POSSIBILITANDO A ABERTURA DE OUTRO PAINEL.

        this.el.panelEditProfile.hide()
        this.el.panelAddContact.hide()
    }

    loadElements() {
        // MÉTODO RESPONSAVEL POR ESTANCIAR TODOS OS ELEMENTOS QUE
        // TIVERAM ID NO FORMATO CAMELCASE. TODOS OS ELEMENTOS FICAM 
        // DISPONIVEIS EM app.el

        this.el = {}
        document.querySelectorAll("[id]").forEach(element => {
            this.el[Format.getCamelCase(element.id)] = element;
        });
    }

    elementsPrototype() {
        // MÉTODO RESPONSAVEL POR CRIAR METODOS NO PROTOTYPE NO JS
        // PARA SIMPLIFICAÇÃO E RAPIDEZ DO CÓDIGO.

        Element.prototype.hide = function () {
            this.style.display = "none"
            return this;
        }

        Element.prototype.show = function () {
            this.style.display = "block"
            return this;
        }

        Element.prototype.toggle = function () {
            this.style.display = (this.style.display === "none") ? "block" : "none";
            return this;
        }

        Element.prototype.on = function (events, fn) {
            const eventList = events.split(" ");
            eventList.forEach(event => {
                this.addEventListener(event, fn);
            })
            return this;
        }

        Element.prototype.css = function (styles) {
            for (let name in styles) {
                this.style[name] = styles[name]
            }
            return this;
        }

        Element.prototype.addClass = function (className) {
            this.classList.add(className);
            return this;
        }

        Element.prototype.removeClass = function (className) {
            this.classList.remove(className);
            return this;
        }

        Element.prototype.toggleClass = function (className) {
            this.classList.toggle(className);
            return this;
        }

        Element.prototype.hasClass = function (className) {
            return this.classList.contains(className);
        }

        HTMLFormElement.prototype.getForm = function () {
            return new FormData(this)
        }

        HTMLFormElement.prototype.toJSON = function () {
            const json = {}
            this.getForm().forEach((value, key) => {
                json[key] = value
            })
            return json
        }

    }
}

import { Format } from '../utils/Format'
import { CameraController } from './CameraController'
import { DocumentPreviewController } from './DocumentPreviewController'
import { MicrophoneController } from './MicrophoneController'
import { Datasource } from '../providers/Datasource'
import { LocalStorage } from '../providers/Localstorage'
import { User } from '../entities/User'
import { Contact } from '../entities/Contact'
import { Chat } from '../entities/Chat'
import { Message } from '../entities/Message'

export class WhatsAppController {
    constructor() {
        window.datasource = new Datasource(new LocalStorage("@morfeu-whatsapp"));
        this._user = null;
        this._activeContact = null;
        this.elementsPrototype();
        this.loadElements();
        this.initEvents();
        this.initUserInfos();
        this._messagesForUpdate = [];
        this.intervalForMessagesUpdate();
        console.log("\n=== CONFIGURAÇÃO INICIAL FINALIZADA ===")
    }

    /**
     * @description Função responsável por monitorar novas mensagens e atualizar o status das mesmas
     * @returns {void}
     */
    intervalForMessagesUpdate() {
        /** 
         * @param {Message} message
         * @param {('sent'|'read'|'received')} statusToGo
         */
        function updateMessageStatus(message, statusToGo) {
            const messageElement = document.querySelector(`#_${message.id}`)
            if (!messageElement) return;
            messageElement.querySelector('.message-status').remove();
            message._status = statusToGo;
            messageElement.querySelector('.message-time').parentElement.appendChild(message.getStatusViewElement());
        }

        setInterval(() => {
            if (this._messagesForUpdate.length > 0) {
                /** @type {Message} message */
                const message = this._messagesForUpdate[0].message
                const statusToGo = this._messagesForUpdate[0].status
                updateMessageStatus(message, statusToGo)
                this._messagesForUpdate.shift()
            }
        }, 5000) //5 segundos
    }

    initEvents() {
        this.el.inputSearchContacts.on('keyup', () => {
            if (this.el.inputSearchContacts.value.length > 0) {
                this.el.inputSearchContactsPlaceholder.hide();
                this._user.filterContacts(this.el.inputSearchContacts.value)
            } else {
                this.el.inputSearchContactsPlaceholder.show();
                this._user.loadContacts()
            }

        })

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
            this.el.btnSavePanelEditProfile.disabled = true;
            this._user.update({
                name: this.el.inputNamePanelEditProfile.innerHTML,
            })
            this.el.btnSavePanelEditProfile.disabled = false;
        })

        this.el.formPanelAddContact.on("submit", event => {
            event.preventDefault();
            const formData = new FormData(this.el.formPanelAddContact);

            fetch('https://randomuser.me/api/').then(response => {
                return response.json();
            }).then(data => {
                const userData = data.results[0];
                
                Chat.createIfNotExists(formData.get('email'))
                const newContact = new Contact({
                    email: formData.get('email'),
                    name: userData.name.first + ' ' + userData.name.last,
                    photo: userData.picture.thumbnail,
                })
    
                this._user.addContact(newContact)

                this.el.formPanelAddContact.reset();
                this.el.btnClosePanelAddContact.click();
            })

            
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
                Message.sendImage(this._activeContact.email, this._user.email, file).then(message => {
                    const messageView = message.getViewElement(message.from === this._user.email)
                    this.el.panelMessagesContainer.appendChild(messageView)
                    this._messagesForUpdate.push({message: message, status: 'sent'})
                    this._messagesForUpdate.push({message: message, status: 'received'})
                    this._messagesForUpdate.push({message: message, status: 'read'})
                })
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


        this.el.btnClosePanelDocumentPreview.on("click", () => {
            this.closeAllMainPanel();
            this.el.panelMessagesContainer.show();
        });

        this.el.btnSendPicture.on("click", () => {
            const regex = /^data:(.+);base64,(.*)$/;
            const resultArray = this.el.pictureCamera.src.match(regex);
            const mimeType = resultArray[1];
            const fileExtension = mimeType.split('/')[1];
            const filename = `camera-photo-${Date.now()}.${fileExtension}`;

            this.el.btnSendPicture.disabled = true;

            /** Rotacionar imagem */
            const picture = new Image();
            picture.src = this.el.pictureCamera.src;
            picture.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = picture.width;
                canvas.height = picture.height;

                context.translate(picture.width, 0);
                context.scale(-1, 1);

                context.drawImage(picture, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL(mimeType);

                /** Tranformando imagem base64 para arquivo */
                fetch(dataUrl)
                .then(response => {
                    return response.arrayBuffer();
                })
                .then(buffer => {
                    return new File([buffer], filename, {
                        type: mimeType,
                        lastModified: Date.now()
                    });
                })
                .then(file => {
                    Message.sendImage(this._activeContact.email, this._user.email, file).then(message => {
                        const messageView = message.getViewElement(message.from === this._user.email)
                        this.el.panelMessagesContainer.appendChild(messageView)
                        this._messagesForUpdate.push({message: message, status: 'sent'})
                        this._messagesForUpdate.push({message: message, status: 'received'})
                        this._messagesForUpdate.push({message: message, status: 'read'})
                    })
                    this.el.btnSendPicture.disabled = false;
                    this.closeAllMainPanel();
                    this._camera.stop();
                    this.el.btnReshootPanelCamera.hide();
                    this.el.pictureCamera.hide();
                    this.el.videoCamera.show();
                    this.el.containerTakePicture.show();
                    this.el.containerSendPicture.hide();
                    this.el.panelMessagesContainer.show();
                    
                })
            }
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
            let scrollTop = this.el.panelMessagesContainer.scrollTop;
            let scrollTopMax = this.el.panelMessagesContainer.scrollHeight - this.el.panelMessagesContainer.offsetHeight;
            let autoScroll = scrollTop >= scrollTopMax;
            const message = Message.send(this._activeContact.email, this._user.email, 'text', this.el.inputText.innerHTML);
            const messageView = message.getViewElement(message.from === this._user.email)
            this.el.panelMessagesContainer.appendChild(messageView)
            this.el.inputText.innerHTML = "";
            this.el.panelEmojis.removeClass("open");

            if (autoScroll) {
                this.el.panelMessagesContainer.scrollTop = this.el.panelMessagesContainer.scrollHeight - this.el.panelMessagesContainer.offsetHeight;
            } else {
                this.el.panelMessagesContainer.scrollTop = scrollTop;
            }

            this._messagesForUpdate.push({message: message, status: 'sent'})
            this._messagesForUpdate.push({message: message, status: 'received'})
            this._messagesForUpdate.push({message: message, status: 'read'})
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
        const userContent = window.datasource.findByEmail('contato@guilhermeselair.dev')

        if (userContent) {
            this._user = new User(userContent)
        } else {
            this._user = new User(User.createDefaultUser())
        }

        this._user.on("datachange", data => {
            document.querySelector('title').innerHTML = data.name + ' - WhatsApp Clone';
            this.el.inputNamePanelEditProfile.innerHTML = data.name;
            if (data.photo) {
                const profilePhoto = this.el.imgPanelEditProfile;
                profilePhoto.src = data.photo;
                profilePhoto.show();
                this.el.imgDefaultPanelEditProfile.hide();

                this.el.myPhoto.querySelector('img').src = data.photo;
                this.el.myPhoto.querySelector('img').show();
            }

            this.initContactsList();
        })
    }

    initContactsList() {
        this._user.on("contactschange", contacts => {
            this.el.contactsMessagesList.innerHTML = "";
            
            contacts.forEach(contact => {
                const contactEl = document.createElement('div');
                contactEl.classList.add('contact-item');
                contactEl.id = `contact-${contact.email}`;
                contactEl.innerHTML = `
                    <div class="dIyEr">
                        <div class="_1WliW" style="height: 49px; width: 49px;">
                            <img src="#" class="Qgzj8 gqwaM photo" style="display:none;">
                            <div class="_3ZW2E">
                                <span data-icon="default-user" class="">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212" width="212" height="212">
                                        <path fill="#DFE5E7" d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z"></path>
                                        <g fill="#FFF">
                                            <path d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z"></path>
                                        </g>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="_3j7s9">
                        <div class="_2FBdJ">
                            <div class="_25Ooe">
                                <span dir="auto" title="${contact.name}" class="_1wjpf">${contact.name}</span>
                            </div>
                            <div class="_3Bxar">
                                <span class="_3T2VG">${contact.lastMessageTime}</span>
                            </div>
                        </div>
                        <div class="_1AwDx">
                            <div class="_itDl">
                                <span title="digitando…" class="vdXUe _1wjpf typing" style="display:none">digitando…</span>
        
                                <span class="_2_LEW last-message">
                                    <div class="_1VfKB">
                                        <span data-icon="status-dblcheck" class="">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">
                                                <path fill="#263238" fill-opacity=".4" d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-.427-.388a.381.381 0 0 0-.578.038l-.451.576a.497.497 0 0 0 .043.645l1.575 1.51a.38.38 0 0 0 .577-.039l7.483-9.602a.436.436 0 0 0-.076-.609zm-4.892 0l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-2.614-2.556a.435.435 0 0 0-.614.007l-.505.516a.435.435 0 0 0 .007.614l3.887 3.8a.38.38 0 0 0 .577-.039l7.483-9.602a.435.435 0 0 0-.075-.609z"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <span dir="ltr" class="_1wjpf _3NFp9">${contact.lastMessage}</span>
                                    <div class="_3Bxar">
                                        <span>
                                            <div class="_15G96">
                                                <span class="OUeyt messages-count-new" style="display:none;">1</span>
                                            </div>
                                    </span></div>
                                </span>
                            </div>
                        </div>
                    </div>
                `

                if(contact.photo) {
                    contactEl.querySelector('.photo').src = contact.photo
                    contactEl.querySelector('.photo').show()
                }

                contactEl.on('click', () => {
                    this.setActiveChat(contact)
                })
                this.el.contactsMessagesList.appendChild(contactEl)
            })
        })
        
        this._user.loadContacts()
    }

    setActiveChat(contact){
        this._activeContact = contact
        this.el.panelMessagesContainer.innerHTML = ""
        this.el.activeName.innerHTML = contact.name
        this.el.activeStatus.innerHTML = contact.status

        if (contact.photo) {
            this.el.activePhoto.src = contact.photo
            this.el.activePhoto.show()
        }

        this.el.home.hide()
        this.el.main.css({
            display: 'flex'
        })

        /** Exibir mensagens existentes em tela */
        const chatContent = window.datasource.findOne(`chat-${contact.email}`)

        if (chatContent.messages) {
            let scrollTop = this.el.panelMessagesContainer.scrollTop;
            let scrollTopMax = this.el.panelMessagesContainer.scrollHeight - this.el.panelMessagesContainer.offsetHeight;
            let autoScroll = scrollTop >= scrollTopMax;
            console.log(scrollTop, scrollTopMax, autoScroll)
            chatContent.messages.forEach(existedMessage => {
                const message = new Message({
                    id: existedMessage.id,
                    content: existedMessage.content,
                    type: existedMessage.type,
                    createdAt: existedMessage.createdAt,
                    from: existedMessage.from,
                    status: 'read'
                })

                const messageView = message.getViewElement(existedMessage.from === this._user.email)
                this.el.panelMessagesContainer.appendChild(messageView)
            })

            if (autoScroll) {
                this.el.panelMessagesContainer.scrollTop = this.el.panelMessagesContainer.scrollHeight - this.el.panelMessagesContainer.offsetHeight;
            } else {
                this.el.panelMessagesContainer.scrollTop = scrollTop;
            }
        }
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
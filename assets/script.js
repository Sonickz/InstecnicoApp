
//*VITALS
const root = document.getElementById("root")
const documentCardModal = document.querySelector(".document-card")
let actualPage = "index"
let backPage;
const actualDate = new Date()
renderPage(actualPage)
activeIcon(actualPage)
const newsCant = 5

//*

//*FUNCTIONS

//Active icon
function activeIcon(pageName) {
    const icons = document.querySelectorAll(".app-footer .icon")

    icons.forEach(icon => {
        icon.style.display = "block"
        icon.nextElementSibling.style.display = "none"
        if (icon.classList.contains(pageName)) {
            icon.style.display = "none"
            icon.nextElementSibling.style.display = "block"
        }
    })
}

//Actual page name
function setActualPage(name) {
    backPage = actualPage
    actualPage = name
}

//Render page
async function renderPage(name) {
    switch (name) {
        case "new-request":
            document.body.classList.add("new-request")
            break;

        default:
            document.body.classList.remove("new-request")
            break;
    }

    const pages = document.getElementById("pages")
    const actualPage = root.firstChild
    if (actualPage) {
        const originalActualPage = pages.querySelector(`.${actualPage.classList[0]}`)
        pages.removeChild(originalActualPage)
        pages.appendChild(actualPage)
    }

    const newPage = pages.querySelector(`.${name}`).cloneNode(true)
    setActualPage(name)
    activeIcon(name)
    root.innerHTML = ""
    root.appendChild(newPage)
}

function back() {
    renderPage(backPage)
}

//Format date
function convertLongDate(date, type) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const day = days[date.getDay()]
    const dayNumber = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hour = date.toLocaleTimeString('es-ES', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    })

    switch (type) {
        case "long":
            return `${day}, ${month} ${dayNumber}, ${year}`
        case "short":
            return `${month} ${dayNumber}, ${year} • ${hour}`
    }
}

//Close modal
function closeModal() {
    setTimeout(() => {
        documentCardModal.classList.remove("waiting", "accepted", "pending", "rejected", "pay-modal")
        const btnPay = documentCardModal.querySelector(".card-footer .btn-pay")
        if (btnPay) btnPay.remove()
    }, 500)
    documentCardModal.classList.remove("active")
}

function openDocumentCard() {
    const documents = root.querySelectorAll(".document")

    const downloadZoneText = documentCardModal.querySelector(".download-zone .text")
    const cardTitle = documentCardModal.querySelector(".data .title h1")
    const cardStatusText = documentCardModal.querySelector(".data .status .text")
    const closeModalBtn = documentCardModal.querySelector(".close-modal")

    const downloadStatus = {
        "waiting": "Esperando",
        "accepted": "document.pdf",
        "pending": "Pendiente de pago",
        "rejected": "Solicitud rechazada"
    }

    documents.forEach(doc => {
        const documentStatus = doc.getAttribute("data-status")
        const documentTitle = doc.querySelector(".document-title").textContent
        const documentStatusText = doc.querySelector(".status span").textContent

        doc.addEventListener("click", () => {
            cardTitle.textContent = documentTitle
            cardStatusText.textContent = documentStatusText
            downloadZoneText.textContent = downloadStatus[documentStatus]
            documentCardModal.classList.add(documentStatus)
            documentCardModal.classList.add("active")
            if (documentStatus == "pending") {
                const cardFooter = documentCardModal.querySelector(".card-footer")
                const payButton = document.createElement("button")
                payButton.textContent = "Pagar"
                payButton.classList.add("btn", "btn-pay")
                cardFooter.appendChild(payButton)
                payButton.onclick = () => {
                    documentCardModal.classList.add("pay-modal")
                    setTimeout(() => {
                        window.open("https://www.pse.com.co/persona-tu-primer-pago-por-pse")
                        documentCardModal.classList.remove("pay-modal")
                    }, 3000);
                }
            }
        })

    })

    documentCardModal.addEventListener("click", (e) => {
        if (e.target === documentCardModal) {
            closeModal()
        }
    })
    closeModalBtn.addEventListener("click", closeModal)
}

//***

//*Observer

const observer = new MutationObserver(function (mutationsList, observer) {
    all();
})
observer.observe(root, { childList: true })

//***

//*GENERAL

//Nav elements click
const navElements = document.querySelectorAll(".app-footer .active")
navElements.forEach(element => {
    element.addEventListener("click", () => {
        renderPage(element.getAttribute("data-page"))
    })
})

//***

//*All

function all() {

    //News
    const allNews = root.querySelector(".today-news .news")
    if (allNews) {
        const defaultNew = allNews.querySelector(".new")
        for (let i = 1; i < newsCant; i++) {
            const newElement = defaultNew.cloneNode(true)
            allNews.appendChild(newElement)
        }
    }

    //Span dates
    const spanDates = root.querySelectorAll(".today-date")
    spanDates ? spanDates.forEach(span => {
        const dateType = span.classList.contains("long-date") ? "long" : "short"
        span.textContent = convertLongDate(actualDate, dateType)
    }) : null

    //Documents & Card modal
    const documentsZone = root.querySelector(".documents .requests")
    const documents = root.querySelectorAll(".documents .document")

    if (documentsZone) {
        const newDocument = JSON.parse(localStorage.getItem("newDocument"))
        if (newDocument) {
            const newDocumentElement = documents[0].cloneNode(true)

            newDocumentElement.querySelector(".document-title").textContent = newDocument.title
            newDocumentElement.querySelector("img").setAttribute("src", newDocument.image)
            newDocumentElement.querySelector(".today-date").textContent = convertLongDate(new Date(), "short")

            documentsZone.insertBefore(newDocumentElement, documentsZone.firstChild)
            localStorage.removeItem("newDocument")
            openDocumentCard()
        }
        openDocumentCard()

        //Close modal with drag
        const documentCard = document.querySelector(".document-card .card")
        let dragging = false
        let startY;
        let initialHeight = 415
        let actualHeight = initialHeight

        documentCard.addEventListener("mousedown", (e) => {
            documentCard.classList.remove("transition")
            dragging = true
            startY = e.clientY
        })

        document.addEventListener("mousemove", (e) => {
            if (dragging) {
                const height = initialHeight - (e.clientY - startY)
                actualHeight = height
                if (height < initialHeight) documentCard.style.height = `${height}px`
                if (height < initialHeight / 2) closeModal()
            }
        })

        document.addEventListener("mouseup", () => {
            dragging = false
            startY = 0
            documentCard.classList.add("transition")
            if (!actualHeight < initialHeight / 2) documentCard.style.height = `${initialHeight}px`
        })
    }

    //New request
    const requests = root.querySelectorAll(".new-request .request")
    if (requests.length > 0) {
        const nextButton = root.querySelector(".new-request .next")
        let selectedRequest;

        requests.forEach(request => {
            request.addEventListener("click", () => {
                requests.forEach(req => {
                    req.classList.remove("active")
                })
                request.classList.add("active")
                selectedRequest = request
            })
        })

        nextButton.addEventListener("click", () => {
            if (!selectedRequest) {
                return
            }
            const newDocument = selectedRequest
            const newDocumentTitle = newDocument.querySelector("p").textContent
            const newDocumentImage = newDocument.querySelector("img").getAttribute("src")
            localStorage.setItem("newDocument", JSON.stringify({
                title: newDocumentTitle,
                image: newDocumentImage
            }))
            requests.forEach(request => {
                request.classList.remove("active")
            })
            renderPage("documents")
        })
    }
}

all();

//***
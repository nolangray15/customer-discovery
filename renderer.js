// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron')
const { ipcRenderer } = electron

const form = document.querySelector('form')
form.addEventListener('submit', submitForm)

function submitForm(e) {
    e.preventDefault()
    const url = document.querySelector('#searchUrl').value
    const numInvites = document.querySelector('#numInvites').value
    const message = document.querySelector('#message').value

    urlRegex = /^https:\/\/www.linkedin.com\/search\/results\/people\/\?[^ "]+$/;
    numInvitesRegex = /^\d+$/;
    console.log(urlRegex.test(url))
    console.log(numInvitesRegex.test(numInvites))

    // const li = document.createElement('li')
    // const text = document.createTextNode('Submitted :)')
    // li.appendChild(text)
    // document.forms.appendChild(li)

}
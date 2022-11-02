import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onGetUserPos = onGetUserPos
window.onSearch = onSearch
window.onSave = onSave
window.onDelete = onDelete
window.onShare = onShare
window.onGoTo = onGoTo

function onInit() {
    getCurrPosition()
        .then(({ coords }) => {
            const { latitude, longitude } = coords
            return { lat: latitude, lng: longitude }
        })
        .catch(() => null)
        .then(pos => {
            mapService.initMap(pos)
                .then(() => {
                    console.log('Map is ready')
                    renderLocations()
                })
                .catch(() => console.log('Error: cannot init map'))
        })
}

function onSearch(ev) {
    ev.preventDefault()

    const searchInput = document.querySelector('.location-search input[type="search"]').value
    mapService.getLocByKeyword(searchInput)
        .then(({ location: pos, formattedAddress }) => {
            const marker = mapService.addMarker(pos)
            mapService.createInfoWindow(renderWindowInfo(pos, formattedAddress), marker)
            mapService.panTo(pos, 11)
            // TODO - Open InfoWindow
            updateTitle(formattedAddress)
        })

}

function renderWindowInfo({ lat, lng }, formattedAddress) {
    return `
        <form onsubmit="onSave(event, ${lat}, ${lng}, this)">
            <h4>${formattedAddress}</h4>
            <input type="text" placeholder="Enter location nickname" />
            <button>Save</button>
        </form>
    `
}

function updateTitle(txt) {
    document.querySelector('.current-location span').innerText = txt
}

function onAddMarker() {
    console.log('Adding a marker')
    mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 })
}

function renderLocations() {
    locService.getLocs()
        .then(locs => {
            const strLocs = locs.map(renderLocation).join('')
            // console.log('Locations:', locs)

            document.querySelector('.saved-locations')
                .innerHTML = strLocs
        })
}

function renderLocation({ id, name, formattedAddress }) {
    return `
        <article class="location-card">
            <div>
                <h3>${name}</h3>
                <p>${formattedAddress}</p>
            </div>

            <div class="location-actions">
                <button class="btn-go" onclick="onGoTo('${id}')">GO</button>
                <button class="btn-share" onclick="onShare('${id}')">Share</button>
                <button class="btn-delete" onclick="onDelete('${id}')">Delete</button>
            </div>
        </article>
    `
}

function onGoTo(locId) {
    console.log('Panning the Map')
    locService.getLocById(locId)
        .then(({ pos }) => mapService.panTo(pos))
}

function onShare(locId) {
    locService.getLocById(locId)
        .then(({ pos }) =>
            window.location.href + `?lat=${pos.lat}&lng=${pos.lng}`)
        .then(url => {
            navigator.clipboard.writeText(url)
                .then(() => console.log('Copid'))
        })
}

function onSave(ev, lat, lng, elInput) {
    ev.preventDefault()

    const name = elInput.querySelector('input[type="text"]').value
    const formattedAddress = elInput.querySelector('h4').innerText
    const pos = { lat, lng }
    locService.addLoc(name, pos, formattedAddress)
        .then(({ id: locId }) => {
            mapService.addMarker(pos, name, locId)
            renderLocations()
        })
}

function onDelete(locId) {
    mapService.deleteMarker(locId)
        .then(() => locService.deleteLoc(locId))
        .then(renderLocations)
}

//     { id, name, pos, formattedAddress }, 

function onGetUserPos() {
    getCurrPosition()
        .then(({ coords }) => {
            const { latitude, longitude } = coords
            console.log('User position is:', coords)
            return { lat: latitude, lng: longitude }
        })
        .then(pos => {
            mapService.panTo(pos)

            document.querySelector('.user-pos').innerText =
                `Latitude: ${pos.lat} - Longitude: ${pos.lng}`
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getCurrPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

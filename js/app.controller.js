import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onGetUserPos = onGetUserPos
window.onSearch = onSearch

function onInit() {
    mapService.initMap()
        .then(() => {
            console.log('Map is ready')
            renderLocations()
        })
        .catch(() => console.log('Error: cannot init map'))
}

function onSearch(ev) {
    ev.preventDefault()

    const searchInput = document.querySelector('.location-search input[type="search"]').value
    mapService.getLocByKeyword(searchInput)
        .then(({ location, formattedAddress }) => {
            mapService.panTo(location.lat, location.lng, 10)
            // TODO open InfoWindow
            updateTitle(formattedAddress)
        })

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
            console.log('Locations:', locs)

            document.querySelector('.saved-locations')
                .innerHTML = strLocs
        })
}

function renderLocation({ id, name, formattedAddress }) {
    return `
        <article class="location-card">
            <h3>${name}</h3>
            <h5>${formattedAddress}</h5>
            <button class="btn-go" onclick="onGoTo('${id}')">GO</button>
            <button class="btn-share" onclick="onShare('${id}')">Share</button>
            <button class="btn-delete" onclick="onDelete('${id}')">Delete</button>
        </article>
    `
}

function onGoTo(locationId) {
    console.log('Panning the Map')
    mapService.panTo(lat, lng)
}

function onShare() {
    
}

function onDelete() {

}

function onGetUserPos() {
    getCurrPosition()
        .then(({ coords }) => {
            console.log('User position is:', coords)
            mapService.panTo(coords.latitude, coords.longitude)

            document.querySelector('.user-pos').innerText =
                `Latitude: ${coords.latitude} - Longitude: ${coords.longitude}`
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

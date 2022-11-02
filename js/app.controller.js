import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onGetUserPos = onGetUserPos
window.onSearch = onSearch
window.onSave = onSave

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
        .then(({ location:pos, formattedAddress }) => {
            const marker =  mapService.addMarker(pos)
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
            console.log('Locations:', locs)

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
                <button class="btn-go" onclick="onPanTo('${id}')">GO</button>
                <button class="btn-share" onclick="onShare('${id}')">Share</button>
                <button class="btn-delete" onclick="onDelete('${id}')">Delete</button>
            </div>
        </article>
    `
}

function onGoTo(locationId) {
    console.log('Panning the Map')
    mapService.panTo(lat, lng)
}

function onShare() {
    
}

function onSave(ev, lat, lng, elInput) {
    ev.preventDefault()

    // console.log('Saved', 'elinput:', elInput);
    // console.log('nickname', elInput.querySelector('input[type="text"]').value);
    // console.log('formatted address', elInput.querySelector('h4').innerText);
    // locService.addLoc()
    const name = elInput.querySelector('input[type="text"]').value
    const formattedAddress = elInput.querySelector('h4').innerText
    const pos = {lat, lng}
    locService.addLoc(name, pos, formattedAddress)
    renderLocations()
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

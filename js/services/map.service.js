import { locService } from './loc.service.js'
export const mapService = {
    initMap,
    panTo,
    addMarker,
    removeMarker,
    getLocByKeyword
}

const API_KEY = 'AIzaSyBL3ZxetNDgUPAs_yW57YL8pXknqKOfo7k'

// Var that is used throughout this Module (not global)
var gMap
var gMarkers = []
// [
//     { id, marker }
// ]

function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap')
    return _connectGoogleApi()
        .then(() => {
            console.log('google available')
            gMap = new google.maps.Map(
                document.querySelector('.map'), {
                center: { lat, lng },
                zoom: 15
            })
            loadMarkers()
            console.log('Map!', gMap)
        })
}

function loadMarkers() {
    locService.getLocs()
        .then(locs => {
        locs.forEach(({ id, name, lat, lng }) => {
            const pos = { lat, lng }
            gMarkers.push({ id, marker: addMarker(pos, name) })
        })
    })
}

function addMarker(pos, name) {
    var marker = new google.maps.Marker({
        position: pos,
        map: gMap,
        title: name
    })
    return marker
}

function removeMarker(id) {
    const idx = gMarkers.findIndex(marker => marker.id === id)
    const mark = gMarkers[idx].marker
    mark.setVisible(false)
    gMarkers.splice(idx, 1)[0]
}

function panTo(lat, lng, zoom = 8) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
    gMap.setZoom(zoom)
}

function getLocByKeyword(keyword) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${keyword}&key=${API_KEY}`
    fetch(url)
        .then(res => res.json())
        .then(({ results }) => {
            const { geometry, formatted_address } = results
            return {
                formattedAddress: formatted_address,
                location: geometry.location
            }
        })
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    var elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}
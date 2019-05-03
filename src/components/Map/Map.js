import React from 'react'
import styled from 'styled-components'
import GoogleMapReact from 'google-map-react'
import Marker from './Marker'
import Tabs from '../UI/Tabs'
import FormFPVSpot from '../UI/FormFPVSpot'
import Button from '@material-ui/core/Button'
import Dice from '@material-ui/icons/Casino'
import { earthLines } from '../../utils/svg'

// Setup Google Maps API key
const API_KEY = process.env.GATSBY_GOOGLE_MAPS_KEY || ''

const Loader = styled.div`
  display: flex;
  height: 70vh;
  justify-content: center;

  img {
    animation: infinite-spinning 2s infinite;
    width: 10rem;
  }

  @keyframes infinite-spinning {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const GoogleMapContainer = styled.div`
  height: 50vh;
  width: 100%;

  @media (min-width: 1200px) {
    height: 60vh;
  }
`

class SimpleMap extends React.Component {
  state = {
    center: {
      lat: 33.749, // Helsinki: 60.16
      lng: 84.388, // Helsinki: 24.93
    },
    loading: true,
    zoom: 11,
    markers: this.props.markers,
    newMarker: null,
    currentPlace: {
      ...this.props.markers[0].node,
    },
  }

  _onClick = ({ x, y, lat, lng, event }) => {
    // Save the current clicked space to LS and state
    let newMarker = {
      lat,
      lng,
    }

    this.setState({ newMarker: newMarker })
  }

  _onChildClick = (key, childProps) => {
    // Update current selected element
    this.setState({
      currentPlace: childProps,
    })
  }

  _onChildMouseEnter = (key, childProps) => {}

  _onChildMouseLeave = () => {}

  handleDiscoverNewSpot = () => {
    // Get lat and lng from a random fpv spot
    let randomIndex = Math.floor(Math.random() * this.state.markers.length)

    // Extract spot coordinates
    let { lat, lng } = this.state.markers[randomIndex].node

    // Update state to new spot
    this.setState({
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
      currentPlace: this.state.markers[randomIndex].node,
    })
  }

  componentDidMount() {
    // Request user geo location
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords

        this.setState({
          center: { lat: latitude, lng: longitude },
          loading: false,
        })

        // TODO: Calculate if there is any spots near to where the user is and select one of those to display instead of a random one
        this.handleDiscoverNewSpot()
      },
      () => {
        this.setState({ loading: false })
        this.handleDiscoverNewSpot()
      }
    )
  }

  render() {
    const { center, loading, markers, zoom } = this.state

    if (loading) {
      return (
        <Loader>
          <img
            src={earthLines}
            alt="earth parallels and meridians illustration"
          />
        </Loader>
      )
    }

    return (
      <div>
        <h3>
          <span style={{ color: '#0375d8' }}>Tap the map</span>
          {` `}
          to add your spot, or {` `}
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: '0.5rem' }}
            onClick={this.handleDiscoverNewSpot}
          >
            Discover a new FPV spot
            <Dice style={{ marginLeft: '0.5rem' }} />
          </Button>
        </h3>
        <GoogleMapContainer>
          <GoogleMapReact
            bootstrapURLKeys={{ key: API_KEY }}
            center={center}
            defaultZoom={zoom}
            onClick={this._onClick}
            onChildClick={this._onChildClick}
            onChildMouseEnter={this._onChildMouseEnter}
            onChildMouseLeave={this._onChildMouseLeave}
            // TODO: add a button at the top that can toggle the map style?
            // options={function(maps) {
            //   return { mapTypeId: 'satellite' }
            // }}

            // TODO: Longer example
            // options={function(maps) {
            //   return {
            //     mapTypeControlOptions: {
            //       style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
            //       position: maps.ControlPosition.BOTTOM_CENTER,
            //       mapTypeIds: [
            //         maps.MapTypeId.ROADMAP,
            //         maps.MapTypeId.SATELLITE,
            //         maps.MapTypeId.HYBRID,
            //       ],
            //     },
            //   }
            // }}
          >
            {/* Render all saved markers */}
            {markers.map(({ node: marker }) => (
              <Marker
                key={marker.id}
                id={marker.id}
                lat={marker.lat}
                lng={marker.lng}
                title={marker.title}
                description={marker.description}
                features={marker.features}
                author={marker.author}
                videoLinks={marker.videoLinks}
                photoLinks={marker.photoLinks}
                isHighlighted={
                  marker.id == this.state.currentPlace.id ? 'true' : 'false'
                }
                zIndex={1}
              />
            ))}
            {/* Render a new marker if user clicked on the map */}
            {this.state.newMarker && (
              <Marker
                isNewMarker={true}
                lat={this.state.newMarker.lat}
                lng={this.state.newMarker.lng}
              />
            )}
          </GoogleMapReact>
        </GoogleMapContainer>
        {/* Tabs - pass the data about the current place down via props */}
        <Tabs currentPlaceData={this.state.currentPlace} />
        {this.state.newMarker && (
          <FormFPVSpot
            name="submit-fpv-spot"
            contentfulType="mapMarkers"
            newMarker={this.state.newMarker}
          />
        )}
      </div>
    )
  }
}

export default SimpleMap

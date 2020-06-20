import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import bbox from '@turf/bbox';
import buffer from '@turf/buffer';

import Map from '#re-map';
import MapContainer from '#re-map/MapContainer';
import MapSource from '#re-map/MapSource';
import MapLayer from '#re-map/MapSource/MapLayer';
import MapBounds from '#re-map/MapBounds';

import { GeoJson } from '../typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

interface Props {
    className?: string;
    oldSource?: GeoJson;
    newSource?: GeoJson;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';

const fillPaint: mapboxgl.FillPaint = {
    'fill-color': '#786cf4',
    'fill-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        1,
        0.06,
    ],
};

const outlinePaint: mapboxgl.LinePaint = {
    'line-color': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        '#786cf4',
        '#f34236',
    ],
    'line-width': 1,
    'line-opacity': 1,
};

const newOutlinePaint: mapboxgl.LinePaint = {
    'line-color': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        '#786cf4',
        '#6200ee',
    ],
    'line-width': 1,
    'line-opacity': 1,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

function MapView(props: Props) {
    const {
        className,
        oldSource,
        newSource,
    } = props;

    const bounds: (BBox | undefined) = useMemo(() => (
        oldSource ? bbox(oldSource) : undefined
    ), [oldSource]);

    return (
        <div className={_cs(styles.map, className)}>
            <Map
                mapStyle={lightStyle}
                mapOptions={{
                    logoPosition: 'bottom-left',
                }}
                scaleControlShown
                navControlShown
            >
                <MapContainer className={styles.mapContainer} />
                <MapBounds
                    bounds={bounds}
                    padding={50}
                />
                {oldSource && (
                    <MapSource
                        sourceKey="old-source"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={oldSource}
                    >
                        <MapLayer
                            layerKey="old-source-fill"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'fill',
                                paint: fillPaint,
                            }}
                        />
                        <MapLayer
                            layerKey="old-source-outline"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'line',
                                paint: outlinePaint,
                            }}
                        />
                    </MapSource>
                )}
                {newSource && (
                    <MapSource
                        sourceKey="new-source"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={newSource}
                    >
                        <MapLayer
                            layerKey="new-source-outline"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'line',
                                paint: newOutlinePaint,
                            }}
                        />
                    </MapSource>
                )}
            </Map>
        </div>
    );
}

export default MapView;

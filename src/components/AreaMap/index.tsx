import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import bbox from '@turf/bbox';

import Map from '#re-map';
import MapContainer from '#re-map/MapContainer';
import MapSource from '#re-map/MapSource';
import MapLayer from '#re-map/MapSource/MapLayer';
import MapBounds from '#re-map/MapBounds';

import { GeoJson } from '#typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

interface Props {
    className?: string;
    feature?: GeoJson;
    featureKey: string | number;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';

const outlinePaint: mapboxgl.LinePaint = {
    'line-color': '#f34236',
    'line-width': 1,
    'line-opacity': 1,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

function AreaMap(props: Props) {
    const {
        className,
        feature,
        featureKey,
    } = props;

    const bounds: (BBox | undefined) = useMemo(() => (
        feature ? bbox(feature) : undefined
    ), [feature]);

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
                {feature && (
                    <MapSource
                        sourceKey={`source-${featureKey}`}
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={feature}
                    >
                        <MapLayer
                            layerKey="new-source-outline"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'line',
                                paint: outlinePaint,
                            }}
                        />
                    </MapSource>
                )}
            </Map>
        </div>
    );
}

export default AreaMap;

import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import bbox from '@turf/bbox';

import Map from '#re-map';
import MapContainer from '#re-map/MapContainer';
import MapSource from '#re-map/MapSource';
import MapLayer from '#re-map/MapSource/MapLayer';
import MapBounds from '#re-map/MapBounds';

import {
    Pointer,
    GeoJson,
    LinkedArea,
} from '#typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

interface Props {
    className?: string;
    feature?: GeoJson;
    featureKey: string | number;
    linkedAreas?: LinkedArea[];
    pointer?: Pointer;
    isDeleted: boolean;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';

const nonClickableOutlinePaint: mapboxgl.LinePaint = {
    'line-color': '#414141',
    'line-width': 1,
    'line-opacity': 1,
};

const redOutlinePaint: mapboxgl.LinePaint = {
    'line-color': '#f34236',
    'line-width': 1,
    'line-opacity': 1,
};

const blueOutlinePaint: mapboxgl.LinePaint = {
    'line-color': '#6200ee',
    'line-width': 1,
    'line-opacity': 1,
};

const bluePaint: mapboxgl.FillPaint = {
    'fill-color': '#6200ee',
    'fill-opacity': 0.3,
};

const redPaint: mapboxgl.FillPaint = {
    'fill-color': '#f34236',
    'fill-opacity': 0.3,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

function AreaMap(props: Props) {
    const {
        className,
        feature,
        featureKey,
        linkedAreas,
        isDeleted,
        pointer,
    } = props;

    const bounds: (BBox | undefined) = useMemo(() => (
        feature ? bbox(feature) : undefined
    ), [feature]);

    const linkedCollection = {
        type: 'FeatureCollection',
        features: linkedAreas?.map((da) => (isDeleted ? da.fromFeature : da.toFeature)),
    };

    const labelLayout: mapboxgl.SymbolLayout = useMemo(() => ({
        'text-field': ['get', pointer?.name],
        'text-size': 14,
        'text-justify': 'center',
        'text-anchor': 'center',
        'text-padding': 0,
    }), [pointer?.name]);

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
                {linkedAreas && (
                    <MapSource
                        sourceKey="non-clickable-source"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={linkedCollection}
                    >
                        <MapLayer
                            layerKey="non-clickable-outline"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'line',
                                paint: nonClickableOutlinePaint,
                            }}
                        />
                        <MapLayer
                            layerKey="non-clickable-label"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'symbol',
                                layout: labelLayout,
                            }}
                        />
                    </MapSource>
                )}
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
                                paint: isDeleted ? redOutlinePaint : blueOutlinePaint,
                            }}
                        />
                        <MapLayer
                            layerKey="selected-area-fill"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'fill',
                                paint: isDeleted ? redPaint : bluePaint,
                            }}
                        />
                        <MapLayer
                            layerKey="feature-label"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'symbol',
                                layout: labelLayout,
                            }}
                        />
                    </MapSource>
                )}
            </Map>
        </div>
    );
}

export default AreaMap;

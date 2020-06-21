import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import buffer from '@turf/buffer';

import Map from '#re-map';
import MapContainer from '#re-map/MapContainer';
import MapSource from '#re-map/MapSource';
import MapLayer from '#re-map/MapSource/MapLayer';
import MapBounds from '#re-map/MapBounds';

// FIXME: Pull typing from appropriate place
import {
    GeoJson,
    AdminLevel,
} from '#views/Home/typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

interface Props {
    className?: string;
    bounds: BBox;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';

const fillPaint: mapboxgl.FillPaint = {
    'fill-color': '#786cf4',
    'fill-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        0.9,
        0.1,
    ],
};

const outlinePaint: mapboxgl.LinePaint = {
    'line-color': '#786cf4',
    'line-width': 1,
    'line-opacity': 1,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

function ClickableMap(props: Props) {
    const {
        className,
        bounds,
        deletedAreas,
        onSelectedAreaChange,
        pointer,
    } = props;

    const collection = {
        type: 'FeatureCollection',
        features: deletedAreas.map((da) => da.feature),
    };
    const handleAreaClick = useCallback((feature) => {
        const selectedArea = deletedAreas.find((da) => da.feature.id === feature.id);
        if (isDefined(selectedArea)) {
            onSelectedAreaChange(selectedArea?.from);
        }
    }, []);

    const labelLayout: mapboxgl.SymbolLayout = useMemo(() => ({
        'text-field': ['get', pointer.name],
        'text-size': 14,
        'text-justify': 'center',
        'text-anchor': 'center',
        'text-padding': 0,
    }), [pointer]);

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
                {deletedAreas && (
                    <MapSource
                        sourceKey="clickable-source"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={collection}
                    >
                        <MapLayer
                            layerKey="new-source-outline"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'line',
                                paint: outlinePaint,
                            }}
                        />
                        <MapLayer
                            layerKey="new-source-fill"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'fill',
                                paint: fillPaint,
                            }}
                            onClick={handleAreaClick}
                        />
                        <MapLayer
                            layerKey="source-label"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'symbol',
                                layout: labelLayout,
                            }}
                            onClick={handleAreaClick}
                        />
                    </MapSource>
                )}
            </Map>
        </div>
    );
}

export default ClickableMap;

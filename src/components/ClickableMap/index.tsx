import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Map from '#re-map';
import MapContainer from '#re-map/MapContainer';
import MapSource from '#re-map/MapSource';
import MapLayer from '#re-map/MapSource/MapLayer';
import MapBounds from '#re-map/MapBounds';

import {
    DeletedItemProps,
    Pointer,
    GeoJson,
} from '#typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

const lightStyle = 'mapbox://styles/mapbox/light-v10';

const labelPaint: mapboxgl.SymbolPaint = {
    'text-halo-color': '#ffffff',
    'text-halo-width': 1,
    'text-halo-blur': 0,
};

const fillPaint: mapboxgl.FillPaint = {
    'fill-color': '#f34236',
    'fill-opacity': [
        'case',
        ['==', ['feature-state', 'hovered'], true],
        0.9,
        0.1,
    ],
};

const nonEmptyFillPaint: mapboxgl.FillPaint = {
    'fill-color': '#919191',
    'fill-opacity': 0.1,
};

const nonClickableOutlinePaint: mapboxgl.LinePaint = {
    'line-color': '#414141',
    'line-width': 1,
    'line-opacity': 1,
};

const outlinePaint: mapboxgl.LinePaint = {
    'line-color': '#f34236',
    'line-width': 1,
    'line-opacity': 1,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noOp = () => {};

interface Props {
    className?: string;
    bounds: BBox;
    deletedAreas: DeletedItemProps[];
    allAreas: GeoJson;
    onSelectedAreaChange: (area: number) => void;
    pointer: Pointer;
}

function ClickableMap(props: Props) {
    const {
        className,
        bounds,
        deletedAreas,
        allAreas,
        onSelectedAreaChange,
        pointer,
    } = props;

    const collection = {
        type: 'FeatureCollection',
        features: deletedAreas.map((da) => da.feature),
    };

    const handleAreaClick = useCallback((feature) => {
        const selectedArea = deletedAreas.find((da) => da?.feature?.id === feature.id);
        if (isDefined(selectedArea)) {
            onSelectedAreaChange(selectedArea?.from);
        }
    }, [onSelectedAreaChange, deletedAreas]);

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
                        sourceKey="clickable-areas"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={collection}
                    >
                        <MapLayer
                            layerKey="clickable-areas-outline"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'line',
                                paint: outlinePaint,
                            }}
                        />
                        <MapLayer
                            layerKey="clickable-areas-fill"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'fill',
                                paint: fillPaint,
                            }}
                            onClick={handleAreaClick}
                        />
                        <MapLayer
                            layerKey="clickable-areas-label"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'symbol',
                                paint: labelPaint,
                                layout: labelLayout,
                            }}
                            onClick={handleAreaClick}
                        />
                    </MapSource>
                )}
                {allAreas && (
                    <MapSource
                        sourceKey="all-areas-source"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={allAreas}
                    >
                        <MapLayer
                            layerKey="all-areas-outline"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'line',
                                paint: nonClickableOutlinePaint,
                            }}
                        />
                        <MapLayer
                            layerKey="all-areas-fill"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'fill',
                                paint: nonEmptyFillPaint,
                            }}
                        />
                        <MapLayer
                            layerKey="all-areas-label"
                            onMouseEnter={noOp}
                            layerOptions={{
                                type: 'symbol',
                                paint: labelPaint,
                                layout: labelLayout,
                            }}
                        />
                    </MapSource>
                )}
            </Map>
        </div>
    );
}

export default ClickableMap;

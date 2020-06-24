import React, { useMemo, useCallback } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';

import calculateArea from '@turf/area';
import bbox from '@turf/bbox';

import Modal from '#components/Modal';
import TextOutput from '#components/TextOutput';
import Button from '#components/Button';
import SelectInput from '#components/SelectInput';
import AreaMap from '#components/AreaMap';
import ClickableMap from '#components/ClickableMap';

import {
    GeoJson,
    Pointer,
    DeletedItemProps,
} from '#typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

interface AreaProps {
    feature: GeoJson;
    featureKey: number;
    code?: string | number;
}

function Area(props: AreaProps) {
    const {
        code,
        feature,
        featureKey,
    } = props;

    return (
        <div className={styles.area}>
            <h3 className={styles.subHeading}>Map</h3>
            <AreaMap
                feature={feature}
                featureKey={featureKey}
            />
            <div className={styles.propertiesContainer}>
                <h3 className={styles.subHeading}>Properties</h3>
                <TextOutput
                    label="Code"
                    value={code}
                />
                <TextOutput
                    label="Area"
                    value={`${calculateArea(feature)} sq.km`}
                />
            </div>
        </div>
    );
}

interface LinkUnlinkProps {
    className?: string;
    to: number;
    code?: string | number;
    feature: GeoJson;
    name?: string;
    from?: number;
    fromFeature?: GeoJson;
    fromName?: string;
    fromCode?: string | number;
    onModalClose: () => void;
    onAreasUnlink: (to: number, from: number) => void;
    onAreasLink: (to: number, from: number) => void;
    selectedDeletedArea?: number;
    setSelectedDeletedArea: (area?: number) => void;
    deletedAreas: DeletedItemProps[];
    pointer: Pointer;
}

const optionKeySelector = (d: DeletedItemProps) => d.from;
const optionLabelSelector = (d: DeletedItemProps) => d.name;

function LinkUnlinkModal(props: LinkUnlinkProps) {
    const {
        className,
        onModalClose,
        to,
        name,
        code,
        feature,
        from,
        fromName,
        fromCode,
        fromFeature,
        onAreasUnlink,
        onAreasLink,
        selectedDeletedArea,
        setSelectedDeletedArea,
        deletedAreas,
        pointer,
    } = props;

    const bounds: (BBox | undefined) = useMemo(() => (
        feature ? bbox(feature) : undefined
    ), [feature]);

    const handleAreasLink = useCallback(() => {
        if (isDefined(to) && isDefined(selectedDeletedArea)) {
            onAreasLink(to, selectedDeletedArea);
        }
    }, [to, selectedDeletedArea, onAreasLink]);

    const handleAreasUnlink = useCallback(() => {
        if (isDefined(to) && isDefined(from)) {
            onAreasUnlink(to, from);
        }
    }, [to, from, onAreasUnlink]);

    return (
        <Modal
            className={_cs(className, styles.linkModal)}
            bodyClassName={styles.linkModalBody}
            onClose={onModalClose}
            header={<h3>{`Link ${name}`}</h3>}
            footer={(
                <div className={styles.modalFooter}>
                    {isDefined(from) ? (
                        <Button
                            variant="danger"
                            onClick={handleAreasUnlink}
                        >
                            Unlink
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleAreasLink}
                            disabled={isNotDefined(selectedDeletedArea)}
                        >
                            Link
                        </Button>
                    )}
                </div>
            )}
        >
            {isDefined(from) ? (
                <div className={styles.currentLinked}>
                    <div className={styles.heading}>
                        {fromName}
                    </div>
                    {isDefined(fromFeature) && isDefined(from) && (
                        <Area
                            code={fromCode}
                            feature={fromFeature}
                            featureKey={from}
                        />
                    )}
                </div>
            ) : (
                <div className={styles.deletedAreasContainer}>
                    <SelectInput
                        optionKeySelector={optionKeySelector}
                        optionLabelSelector={optionLabelSelector}
                        options={deletedAreas}
                        value={selectedDeletedArea}
                        onChange={setSelectedDeletedArea}
                    />
                    <ClickableMap
                        bounds={bounds}
                        pointer={pointer}
                        deletedAreas={deletedAreas}
                        selectedArea={selectedDeletedArea}
                        onSelectedAreaChange={setSelectedDeletedArea}
                    />
                </div>
            )}
            <div className={styles.currentSelection}>
                <div className={styles.heading}>
                    {name}
                </div>
                {isDefined(feature) && isDefined(to) && (
                    <Area
                        code={code}
                        feature={feature}
                        featureKey={to}
                    />
                )}
            </div>
        </Modal>
    );
}

export default LinkUnlinkModal;

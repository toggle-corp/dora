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
    Settings,
} from '#typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

interface AreaProps {
    feature: GeoJson;
    allAreas: GeoJson;
    featureKey: number;
    code?: string | number;
    pointer?: Pointer;
    isDeleted: boolean;
}

function Area(props: AreaProps) {
    const {
        code,
        feature,
        featureKey,
        allAreas,
        pointer,
        isDeleted,
    } = props;

    const area = useMemo(() => `${calculateArea(feature)} sq.km`, [feature]);

    return (
        <div>
            <AreaMap
                feature={feature}
                featureKey={featureKey}
                allAreas={allAreas}
                pointer={pointer}
                isDeleted={isDeleted}
            />
            <div className={styles.propertiesContainer}>
                <h3 className={styles.subHeading}>Properties</h3>
                <TextOutput
                    label="Code"
                    value={code}
                />
                <TextOutput
                    label="Area"
                    value={area}
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
    secondSettings: Settings;
    firstSettings: Settings;
    firstSetTitle: string;
    secondSetTitle: string;
    onNextClick: () => void;
    onPreviousClick: () => void;
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
        onNextClick,
        firstSettings,
        secondSettings,
        onPreviousClick,
        firstSetTitle,
        secondSetTitle,
    } = props;

    const {
        pointer: firstPointer,
        geoJson: firstGeoJson,
    } = firstSettings;

    const {
        pointer: secondPointer,
        geoJson: secondGeoJson,
    } = secondSettings;

    const bounds: (BBox | undefined) = useMemo(() => (
        feature ? bbox(feature) : undefined
    ), [feature]);

    const handleAreasLink = useCallback(() => {
        if (isDefined(to) && isDefined(selectedDeletedArea)) {
            onAreasLink(to, selectedDeletedArea);
        }
    }, [to, selectedDeletedArea, onAreasLink]);

    const handleAreasLinkAndNext = useCallback(() => {
        handleAreasLink();
        onNextClick();
    }, [handleAreasLink, onNextClick]);

    const handleAreasUnlink = useCallback(() => {
        if (isDefined(to) && isDefined(from)) {
            onAreasUnlink(to, from);
        }
    }, [to, from, onAreasUnlink]);

    const handleAreasUnlinkAndNext = useCallback(() => {
        handleAreasUnlink();
        onNextClick();
    }, [handleAreasUnlink, onNextClick]);

    const selectedDeletedAreaObj = useMemo(() => (
        deletedAreas.find((da) => da.from === selectedDeletedArea)
    ), [selectedDeletedArea, deletedAreas]);

    const selectedDeletedObjectArea = useMemo(() => {
        if (isNotDefined(selectedDeletedAreaObj)) {
            return '-';
        }
        return `${calculateArea(selectedDeletedAreaObj.feature)} sq.km`;
    }, [selectedDeletedAreaObj]);

    return (
        <Modal
            className={_cs(className, styles.linkModal)}
            bodyClassName={styles.linkModalBody}
            onClose={onModalClose}
            header={<h3>{`Link ${name}`}</h3>}
            footer={(
                <div className={styles.modalFooter}>
                    <Button
                        className={styles.button}
                        onClick={onPreviousClick}
                    >
                        Previous
                    </Button>
                    <Button
                        className={styles.button}
                        onClick={onNextClick}
                    >
                        Next
                    </Button>
                    {isDefined(from) ? (
                        <>
                            <Button
                                className={styles.button}
                                variant="danger"
                                onClick={handleAreasUnlink}
                            >
                                Unlink
                            </Button>
                            <Button
                                className={styles.button}
                                variant="danger"
                                onClick={handleAreasUnlinkAndNext}
                            >
                                Unlink and Next
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                className={styles.button}
                                variant="primary"
                                onClick={handleAreasLink}
                                disabled={isNotDefined(selectedDeletedArea)}
                            >
                                Link
                            </Button>
                            <Button
                                className={styles.button}
                                variant="primary"
                                onClick={handleAreasLinkAndNext}
                                disabled={isNotDefined(selectedDeletedArea)}
                            >
                                Link and Next
                            </Button>
                        </>
                    )}
                </div>
            )}
        >
            <div className={styles.currentSelection}>
                <h3 className={styles.heading}>
                    {secondSetTitle}
                </h3>
                <div className={styles.heading}>
                    {name}
                </div>
                {isDefined(feature) && isDefined(to) && (
                    <Area
                        code={code}
                        feature={feature}
                        featureKey={to}
                        isDeleted={false}
                        pointer={secondPointer}
                        allAreas={secondGeoJson}
                    />
                )}
            </div>
            {isDefined(from) ? (
                <div className={styles.currentLinked}>
                    <h3 className={styles.heading}>
                        {firstSetTitle}
                    </h3>
                    <div className={styles.heading}>
                        {fromName}
                    </div>
                    {isDefined(fromFeature) && isDefined(from) && (
                        <Area
                            code={fromCode}
                            feature={fromFeature}
                            featureKey={from}
                            allAreas={firstGeoJson}
                            pointer={firstPointer}
                            isDeleted
                        />
                    )}
                </div>
            ) : (
                <div className={styles.deletedAreasContainer}>
                    <h3 className={styles.heading}>
                        {firstSetTitle}
                    </h3>
                    <SelectInput
                        optionKeySelector={optionKeySelector}
                        optionLabelSelector={optionLabelSelector}
                        options={deletedAreas}
                        value={selectedDeletedArea}
                        onChange={setSelectedDeletedArea}
                    />
                    <ClickableMap
                        bounds={bounds}
                        pointer={firstPointer}
                        deletedAreas={deletedAreas}
                        selectedArea={selectedDeletedArea}
                        onSelectedAreaChange={setSelectedDeletedArea}
                        allAreas={firstGeoJson}
                    />
                    {isDefined(selectedDeletedAreaObj) && (
                        <div className={styles.propertiesContainer}>
                            <h3 className={styles.subHeading}>Properties</h3>
                            <TextOutput
                                label="Code"
                                value={selectedDeletedAreaObj.code}
                            />
                            <TextOutput
                                label="Area"
                                value={selectedDeletedObjectArea}
                            />
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}

export default LinkUnlinkModal;

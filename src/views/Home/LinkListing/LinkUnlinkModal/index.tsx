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
    LinkedArea,
} from '#typings';

import styles from './styles.css';

type BBox = [number, number, number, number];

interface AreaProps {
    feature: GeoJson;
    featureKey: number;
    code?: string | number;
    linkedAreas?: LinkedArea[];
    pointer?: Pointer;
    isDeleted: boolean;
}

function Area(props: AreaProps) {
    const {
        code,
        feature,
        featureKey,
        linkedAreas,
        pointer,
        isDeleted,
    } = props;

    return (
        <div>
            <AreaMap
                feature={feature}
                featureKey={featureKey}
                linkedAreas={linkedAreas}
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
    firstPointer: Pointer;
    secondPointer: Pointer;
    onNextClick: () => void;
    onPreviousClick: () => void;
    linkedAreas: LinkedArea[];
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
        firstPointer,
        secondPointer,
        onPreviousClick,
        linkedAreas,
    } = props;

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
                        variant="accent"
                        onClick={onPreviousClick}
                    >
                        Previous
                    </Button>
                    <Button
                        className={styles.button}
                        variant="accent"
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
                            linkedAreas={linkedAreas}
                            pointer={firstPointer}
                            isDeleted
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
                        pointer={firstPointer}
                        deletedAreas={deletedAreas}
                        selectedArea={selectedDeletedArea}
                        onSelectedAreaChange={setSelectedDeletedArea}
                        linkedAreas={linkedAreas}
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
                                value={`${calculateArea(selectedDeletedAreaObj.feature)} sq.km`}
                            />
                        </div>
                    )}
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
                        isDeleted={false}
                        pointer={secondPointer}
                        linkedAreas={linkedAreas}
                    />
                )}
            </div>
        </Modal>
    );
}

export default LinkUnlinkModal;

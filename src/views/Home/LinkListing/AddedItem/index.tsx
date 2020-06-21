import React, { useState, useCallback, useMemo } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';
import calculateArea from '@turf/area';

import TextOutput from '#components/TextOutput';
import Button from '#components/Button';
import Modal from '#components/Modal';
import SelectInput from '#components/SelectInput';
import AreaMap from '#components/AreaMap';

import {
    AdminLevel,
    AdminSet,
    GeoJson,
} from '../../typings';
import {
    getProperty,
    generateMapping,
    Link,
} from '../../utils';

import { DeletedItemProps } from '../index';

import styles from './styles.css';

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

interface AddedItemProps {
    to: Link['to'];
    from?: Link['from'];
    name?: string;
    fromName?: string;
    code?: string | number;
    fromCode?: string | number;
    feature?: GeoJson;
    fromFeature?: GeoJson;
    deletedAreas: DeletedItemProps[];
    onAreasLink: (to: number, from: number) => void;
    onAreasUnlink: (to: number, from: number) => void;
    className?: string;
}

const optionKeySelector = (d: DeletedItemProps) => d.from;
const optionLabelSelector = (d: DeletedItemProps) => d.name;

function AddedItem(props: AddedItemProps) {
    const {
        to,
        from,
        fromName,
        fromCode,
        fromFeature,
        name,
        code,
        feature,
        deletedAreas,
        onAreasLink,
        onAreasUnlink,
        className,
    } = props;

    const [modalVisibility, setModalVisibility] = useState(false);
    const [selectedDeletedArea, setSelectedDeletedArea] = useState<number>();

    const handleLinkButtonClick = useCallback(() => {
        setModalVisibility(true);
    }, [setModalVisibility]);

    const handleModalCloseClick = useCallback(() => {
        setModalVisibility(false);
    }, [setModalVisibility]);

    const handleAreasLink = useCallback(() => {
        if (isDefined(to) && isDefined(selectedDeletedArea)) {
            onAreasLink(to, selectedDeletedArea);
        }
        setModalVisibility(false);
    }, [selectedDeletedArea, to, onAreasLink]);

    const handleAreasUnlink = useCallback(() => {
        if (isDefined(to) && isDefined(from)) {
            onAreasUnlink(to, from);
        }
        setModalVisibility(false);
    }, [selectedDeletedArea, to, onAreasUnlink]);

    const deletedAreaProperties = useMemo(() => {
        if (isNotDefined(selectedDeletedArea)) {
            return undefined;
        }
        return deletedAreas.find((d) => d.from === selectedDeletedArea);
    }, [selectedDeletedArea, deletedAreas]);

    return (
        <div className={_cs(styles.addedItem, className)}>
            <header className={styles.header}>
                <h5 className={styles.title}>{name}</h5>
                <Button
                    className={styles.button}
                    variant="primary"
                    onClick={handleLinkButtonClick}
                >
                    {isDefined(from) ? 'View' : 'Link'}
                </Button>
            </header>
            <TextOutput
                label="Code"
                value={code}
            />
            {modalVisibility && (
                <Modal
                    className={styles.linkModal}
                    bodyClassName={styles.linkModalBody}
                    onClose={handleModalCloseClick}
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
                            {isDefined(deletedAreaProperties) && isDefined(selectedDeletedArea) && (
                                <Area
                                    code={deletedAreaProperties.code}
                                    feature={deletedAreaProperties.feature}
                                    featureKey={selectedDeletedArea}
                                />
                            )}
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}

export default AddedItem;

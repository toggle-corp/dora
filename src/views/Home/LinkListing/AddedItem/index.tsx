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
    name?: string;
    code?: string | number;
    feature?: GeoJson;
    deletedAreas: DeletedItemProps[];
    onAreasLink: (to: number, from: number) => void;
    className?: string;
}

function AddedItem(props: AddedItemProps) {
    const {
        to,
        name,
        code,
        feature,
        deletedAreas,
        onAreasLink,
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
        if (to && selectedDeletedArea) {
            onAreasLink(to, selectedDeletedArea);
        }
        setModalVisibility(false);
    }, [selectedDeletedArea, to]);

    const deletedAreaProperties = useMemo(() => {
        if (!selectedDeletedArea) {
            return undefined;
        }
        return deletedAreas.find((d) => d.from === selectedDeletedArea);
    }, [selectedDeletedArea, deletedAreas]);

    return (
        <div className={_cs(styles.addedItem, className)}>
            <h5 className={styles.title}>{name}</h5>
            <TextOutput
                label="Code"
                value={code}
            />
            <Button
                transparent
                onClick={handleLinkButtonClick}
            >
                Link
            </Button>
            {modalVisibility && (
                <Modal
                    className={styles.linkModal}
                    bodyClassName={styles.linkModalBody}
                    onClose={handleModalCloseClick}
                    header={<h3>{`Link ${name}`}</h3>}
                    footer={(
                        <div className={styles.modalFooter}>
                            <Button
                                variant="primary"
                                onClick={handleAreasLink}
                                disabled={isNotDefined(selectedDeletedArea)}
                            >
                                Link
                            </Button>
                        </div>
                    )}
                >
                    <div className={styles.currentSelection}>
                        <div className={styles.heading}>
                            {name}
                        </div>
                        {feature && to && (
                            <Area
                                code={code}
                                feature={feature}
                                featureKey={to}
                            />
                        )}
                    </div>
                    <div className={styles.deletedAreasContainer}>
                        <SelectInput
                            optionKeySelector={(d) => d.from}
                            optionLabelSelector={(d) => d.name}
                            options={deletedAreas}
                            value={selectedDeletedArea}
                            onChange={setSelectedDeletedArea}
                        />
                        {deletedAreaProperties && selectedDeletedArea && (
                            <Area
                                code={deletedAreaProperties.code}
                                feature={deletedAreaProperties.feature}
                                featureKey={selectedDeletedArea}
                            />
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default AddedItem;

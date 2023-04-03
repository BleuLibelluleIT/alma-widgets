import { FC } from 'react';
import { Card } from 'types';
declare type Props = {
    isCurrentPlanP1X: boolean;
    isSomePlanDeferred: boolean;
    cards?: Card[];
};
declare const DesktopModal: FC<Props>;
export default DesktopModal;

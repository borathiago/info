import { Modal } from '../../../application/domain/entities/modal';
import { ModalOptions } from '../../../application/schemas/modal.schema';

export const createModalFactory = ({ modalUI, moduleID }: ModalOptions): void => {
    new Modal({ moduleID, modalUI })
}
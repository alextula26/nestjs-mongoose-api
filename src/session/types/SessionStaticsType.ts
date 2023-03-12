import { SessionDocument, SessionModelType } from '../../session/schemas';
import { MakeSessionModel } from '.';

export type SessionStaticsType = {
  make: (
    makeSessionModel: MakeSessionModel,
    SessionModel: SessionModelType,
  ) => SessionDocument;
};

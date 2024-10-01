import autoBind from 'auto-bind';

export abstract class BaseController {
  // abstract === interface | type
  constructor() {
    autoBind(this);
  }
}

import { action, observable } from 'mobx';
import { Models } from 'shopify-prime';
import { uniqueId } from 'lodash';

class DashboardStoreFactory {
    constructor() {

    }

    @observable loaded = false;
}

export const DashboardStore = new DashboardStoreFactory();
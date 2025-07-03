import Component from '@glimmer/component';
import config from '../config/environment';

export default class MbpEmbed extends Component {
  get clientId() {
    return config.APP.MBP_CLIENT_ID;
  }
}

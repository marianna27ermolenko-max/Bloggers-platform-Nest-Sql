export class SessionViewModel {
  deviceId: string;
  title: string;
  ip: string;
  lastActiveDate: string;

  static mapToView(data: {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
  }): SessionViewModel {
    const viewModel = new SessionViewModel();

    viewModel.ip = data.ip;
    viewModel.title = data.title;
    viewModel.lastActiveDate = data.lastActiveDate;
    viewModel.deviceId = data.deviceId;

    return viewModel;
  }
}

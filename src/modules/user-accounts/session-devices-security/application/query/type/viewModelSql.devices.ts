export class SessionViewModelSql {
  id: number;
  userId: number;
  deviceId: string;
  title: string;
  ip: string;
  lastActiveDate: Date;
  expirationDate: Date;

  static mapToView(data: {
    id: number;
    userId: number;
    ip: string;
    title: string;
    lastActiveDate: Date;
    deviceId: string;
  }): SessionViewModelSql {
    const viewModel = new SessionViewModelSql();

    viewModel.id = data.id;
    viewModel.userId = data.userId;
    viewModel.ip = data.ip;
    viewModel.title = data.title;
    viewModel.lastActiveDate = data.lastActiveDate;
    viewModel.deviceId = data.deviceId;

    return viewModel;
  }
}

//используем в квери-репозитории
export class SessionViewSqlModel {
  deviceId: string;
  title: string;
  ip: string;
  lastActiveDate: Date;

  static mapToView(data: {
    ip: string;
    title: string;
    lastActiveDate: Date;
    deviceId: string;
  }): SessionViewModelSql {
    const viewModel = new SessionViewModelSql();

    viewModel.ip = data.ip;
    viewModel.title = data.title;
    viewModel.lastActiveDate = data.lastActiveDate;
    viewModel.deviceId = data.deviceId;

    return viewModel;
  }
}

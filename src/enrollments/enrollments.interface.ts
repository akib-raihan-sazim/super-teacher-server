export interface IEnrollment {
  id: number;
  student: IStudent;
}

export interface IStudent {
  id: number;
  user: IUser;
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
}

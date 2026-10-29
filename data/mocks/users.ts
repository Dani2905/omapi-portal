
import { User } from '../../types';
import { STATUS } from '../config';

export const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: 'Daniel Razanajaona',
    email: 'daniel.razanajaona@gmail.com',
    role: 'Admin',
    status: STATUS.ACTIVE
  },
  {
    id: 2,
    name: 'Service Communication OMAPI',
    email: 'communication@omapi.mg',
    role: 'Éditeur',
    status: STATUS.ACTIVE
  }
];


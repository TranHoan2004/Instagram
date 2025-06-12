import {
  Gender,
} from '../enums/general.enum';

export function useOptions() {

  const GENDER_OPTIONS = [
    { label: 'Male', value: Gender.MALE },
    { label: 'Female', value: Gender.FEMALE },
  ];

  return {
    GENDER_OPTIONS,
  };
}

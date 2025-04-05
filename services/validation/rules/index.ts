// lib/validators/index.ts

import AcceptedValidator from './AcceptedValidator';
import ActiveUrlValidator from './ActiveUrlValidator';
import AfterValidator from './AfterValidator';
import AfterOrEqualValidator from './AfterOrEqualValidator';
import AlphaValidator from './AlphaValidator';
import AlphaDashValidator from './AlphaDashValidator';
import AlphaNumValidator from './AlphaNumValidator';
import ArrayValidator from './ArrayValidator';
import BeforeValidator from './BeforeValidator';
import BeforeOrEqualValidator from './BeforeOrEqualValidator';
import BetweenValidator from './BetweenValidator';
import BooleanValidator from './BooleanValidator';
// import CaptchaValidator from './CaptchaValidator'; // Captcha often requires specific integration
// import CompletedValidator from './CompletedValidator'; // 'completed' might be context-dependent
import ConfirmedValidator from './ConfirmedValidator';
import DateValidator from './DateValidator';
import DateEqualsValidator from './DateEqualsValidator';
import DateFormatValidator from './DateFormatValidator';
import DifferentValidator from './DifferentValidator';
import DigitsValidator from './DigitsValidator';
import DigitsBetweenValidator from './DigitsBetweenValidator';
import DimensionsValidator from './DimensionsValidator';
import DistinctValidator from './DistinctValidator';
import EmailValidator from './EmailValidator';
import ExistsValidator from './ExistsValidator';
import FileValidator from './FileValidator';
import FilledValidator from './FilledValidator';
import GreaterThanValidator from './GreaterThanValidator';
import GreaterThanOrEqualValidator from './GreaterThanOrEqualValidator';
import ImageValidator from './ImageValidator';
import InValidator from './InValidator';
import InArrayValidator from './InArrayValidator';
import IntegerValidator from './IntegerValidator';
import IpValidator from './IpValidator';
import Ipv4Validator from './Ipv4Validator';
import Ipv6Validator from './Ipv6Validator';
import JsonValidator from './JsonValidator';
import LessThanValidator from './LessThanValidator';
import LessThanOrEqualValidator from './LessThanOrEqualValidator';
import MaxValidator from './MaxValidator';
import MimesValidator from './MimesValidator';
import MimetypesValidator from './MimetypesValidator';
import MinValidator from './MinValidator';
import NotInValidator from './NotInValidator';
import NotRegexValidator from './NotRegexValidator';
import NullableValidator from './NullableValidator';
import NumericValidator from './NumericValidator';
import RegexValidator from './RegexValidator';
import RequiredValidator from './RequiredValidator';
import SameValidator from './SameValidator';
import SizeValidator from './SizeValidator';
import StringValidator from './StringValidator';
import TimezoneValidator from './TimezoneValidator';
// import UniqueValidator from './UniqueValidator'; // Unique often requires database interaction
import UrlValidator from './UrlValidator';
import UuidValidator from './UuidValidator';

export {
  AcceptedValidator as accepted,
  ActiveUrlValidator as active_url,
  AfterValidator as after,
  AfterOrEqualValidator as after_or_equal,
  AlphaValidator as alpha,
  AlphaDashValidator as alpha_dash,
  AlphaNumValidator as alpha_num,
  ArrayValidator as array,
  BeforeValidator as before,
  BeforeOrEqualValidator as before_or_equal,
  BetweenValidator as between,
  BooleanValidator as boolean,
  // CaptchaValidator as captcha,
  // CompletedValidator as completed,
  ConfirmedValidator as confirmed,
  DateValidator as date,
  DateEqualsValidator as date_equals,
  DateFormatValidator as date_format,
  DifferentValidator as different,
  DigitsValidator as digits,
  DigitsBetweenValidator as digits_between,
  DimensionsValidator as dimensions,
  DistinctValidator as distinct,
  EmailValidator as email,
  ExistsValidator as exists,
  FileValidator as file,
  FilledValidator as filled,
  GreaterThanValidator as gt,
  GreaterThanOrEqualValidator as gte,
  ImageValidator as image,
  InValidator as in_,
  InArrayValidator as in_array,
  IntegerValidator as integer,
  IpValidator as ip,
  Ipv4Validator as ipv4,
  Ipv6Validator as ipv6,
  JsonValidator as json,
  LessThanValidator as lt,
  LessThanOrEqualValidator as lte,
  MaxValidator as max,
  MimesValidator as mimes,
  MimetypesValidator as mimetypes,
  MinValidator as min,
  NotInValidator as not_in,
  NotRegexValidator as not_regex,
  NullableValidator as nullable,
  NumericValidator as numeric,
  RegexValidator as regex,
  RequiredValidator as required,
  SameValidator as same,
  SizeValidator as size,
  StringValidator as string,
  TimezoneValidator as timezone,
  // UniqueValidator as unique,
  UrlValidator as url,
  UuidValidator as uuid,
};

export default {
  accepted: AcceptedValidator,
  active_url: ActiveUrlValidator,
  after: AfterValidator,
  after_or_equal: AfterOrEqualValidator,
  alpha: AlphaValidator,
  alpha_dash: AlphaDashValidator,
  alpha_num: AlphaNumValidator,
  array: ArrayValidator,
  before: BeforeValidator,
  before_or_equal: BeforeOrEqualValidator,
  between: BetweenValidator,
  boolean: BooleanValidator,
  // captcha: CaptchaValidator,
  // completed: CompletedValidator,
  confirmed: ConfirmedValidator,
  date: DateValidator,
  date_equals: DateEqualsValidator,
  date_format: DateFormatValidator,
  different: DifferentValidator,
  digits: DigitsValidator,
  digits_between: DigitsBetweenValidator,
  dimensions: DimensionsValidator,
  distinct: DistinctValidator,
  email: EmailValidator,
  exists: ExistsValidator,
  file: FileValidator,
  filled: FilledValidator,
  gt: GreaterThanValidator,
  gte: GreaterThanOrEqualValidator,
  image: ImageValidator,
  in: InValidator,
  in_array: InArrayValidator,
  integer: IntegerValidator,
  ip: IpValidator,
  ipv4: Ipv4Validator,
  ipv6: Ipv6Validator,
  json: JsonValidator,
  lt: LessThanValidator,
  lte: LessThanOrEqualValidator,
  max: MaxValidator,
  mimes: MimesValidator,
  mimetypes: MimetypesValidator,
  min: MinValidator,
  not_in: NotInValidator,
  not_regex: NotRegexValidator,
  nullable: NullableValidator,
  numeric: NumericValidator,
  regex: RegexValidator,
  required: RequiredValidator,
  same: SameValidator,
  size: SizeValidator,
  string: StringValidator,
  timezone: TimezoneValidator,
  // unique: UniqueValidator,
  url: UrlValidator,
  uuid: UuidValidator,
};
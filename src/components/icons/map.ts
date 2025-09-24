import { TshirtIcon } from './TshirtIcon';
import { PantsIcon } from './PantsIcon';
import { SocksIcon } from './SocksIcon';
import { DressIcon } from './DressIcon';
import { JacketIcon } from './JacketIcon';
import { UnderwearIcon } from './UnderwearIcon';
import { ShoesIcon } from './ShoesIcon';
import { AccessoryIcon } from './AccessoryIcon';
import { BodyIcon } from './BodyIcon';

// Non-component export file to satisfy React Fast Refresh constraints.
export const categoryIcons = {
  sokker: SocksIcon,
  trøjer: TshirtIcon,
  bukser: PantsIcon,
  kjoler: DressIcon,
  jakker: JacketIcon,
  undertøj: UnderwearIcon,
  body: BodyIcon,
  sko: ShoesIcon,
  tilbehør: AccessoryIcon,
};

export type CategoryIconKey = keyof typeof categoryIcons;

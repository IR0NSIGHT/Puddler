export interface BorderSettings {
    getCentreX(): number;
    setCentreX(centreX: number): void;
    getCentreY(): number;
    setCentreY(centreY: number): void;
    getSize(): number;
    setSize(size: number): void;
    getSafeZone(): number;
    setSafeZone(safeZone: number): void;
    getWarningBlocks(): number;
    setWarningBlocks(warningBlocks: number): void;
    getWarningTime(): number;
    setWarningTime(warningTime: number): void;
    getSizeLerpTarget(): number;
    setSizeLerpTarget(sizeLerpTarget: number): void;
    getSizeLerpTime(): number;
    setSizeLerpTime(sizeLerpTime: number): void;
    getDamagePerBlock(): number;
    setDamagePerBlock(damagePerBlock: number): void;
    getChangeNo(): number;
    equals(o: any): boolean;
    hashCode(): number;
    clone(): BorderSettings;
}

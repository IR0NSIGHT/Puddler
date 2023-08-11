package org.pepsoft.worldpainter;

import java.io.Serializable;

public interface BorderSettings extends Serializable, org.pepsoft.util.undo.Cloneable<World2.BorderSettings> {
    int getCentreX();

    void setCentreX(int centreX);

    int getCentreY();

    void setCentreY(int centreY);

    int getSize();

    void setSize(int size);

    int getSafeZone();

    void setSafeZone(int safeZone);

    int getWarningBlocks();

    void setWarningBlocks(int warningBlocks);

    int getWarningTime();

    void setWarningTime(int warningTime);

    int getSizeLerpTarget();

    void setSizeLerpTarget(int sizeLerpTarget);

    int getSizeLerpTime();

    void setSizeLerpTime(int sizeLerpTime);

    float getDamagePerBlock();

    void setDamagePerBlock(float damagePerBlock);

    long getChangeNo();

    @Override
    boolean equals(Object o);

    @Override
    int hashCode();

    @Override
    World2Interface.BorderSettings clone();
}

s/_(BSC6900GSM|BSC6900UMTS|BSC6900GU|BSC6910GSM|BSC6910UMTS|BSC6910GU)//ig;
s/_(BTS3900|PICOBTS3900|BTS3911B|PICOBTS3911B|MICROBTS3900|MICROBTS3911B)//ig;
s/BSC(6910|6900)(UMTS|GSM)Function/FUNCTION/ig;
s/BSC(6910|6900)Equipment/EQUIPMENT/ig;
s/<class name=\"(.*)\"/<class name=\"\U\1\"/ig;
s/<class name=\"(.*)_MSCSERVER/<class name=\"\1/ig;
s/<class name=\"(.*)_ENODEB\"/<class name=\"\1\"/ig;
s/<class name=\"(.*)3900/<class name=\"\1/ig;
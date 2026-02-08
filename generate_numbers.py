def get_thai_number(n):
    thai_digits = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"]
    if n < 10:
        return thai_digits[n]
    if n == 100:
        return "หนึ่งร้อย"
    
    tens = n // 10
    ones = n % 10
    
    parts = []
    
    # Tens part
    if tens == 1:
        parts.append("สิบ")
    elif tens == 2:
        parts.append("ยี่สิบ")
    else:
        parts.append(thai_digits[tens] + "สิบ")
        
    # Ones part
    if ones == 1 and tens > 0:
        parts.append("เอ็ด")
    elif ones > 0:
        parts.append(thai_digits[ones])
        
    return "".join(parts)

def get_transliteration(n):
    digits = ["Soon", "Nueng", "Song", "Sam", "Si", "Ha", "Hok", "Jet", "Paet", "Kao"]
    if n < 10:
        return digits[n]
    if n == 100:
        return "Nueng-roi"
    
    tens = n // 10
    ones = n % 10
    
    t_str = ""
    
    # Tens
    if tens == 1:
        t_str += "Sip"
    elif tens == 2:
        t_str += "Yee-sip"
    else:
        t_str += digits[tens] + "-sip"
        
    # Ones
    if ones == 1:
        t_str += "-et"
    elif ones > 0:
        t_str += "-" + digits[ones]
        
    return t_str

def get_german(n):
    return str(n)

def get_english(n):
    return str(n)

print("    // --- Level Numbers: 1-100 ---")
for i in range(1, 101):
    print(f"    {{ id: {4000+i}, level: 'Numbers', category: 'Numbers', thai: \"{get_thai_number(i)}\", transliteration: \"{get_transliteration(i)}\", german: \"{get_german(i)}\", english: \"{get_english(i)}\" }},")

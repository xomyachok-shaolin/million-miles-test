"""Словари нормализации данных CarSensor: JP → каноничные значения (EN + RU)."""

MAKES: dict[str, tuple[str, str]] = {
    "トヨタ": ("Toyota", "Тойота"),
    "ホンダ": ("Honda", "Хонда"),
    "日産": ("Nissan", "Ниссан"),
    "マツダ": ("Mazda", "Мазда"),
    "スバル": ("Subaru", "Субару"),
    "スズキ": ("Suzuki", "Сузуки"),
    "ダイハツ": ("Daihatsu", "Дайхатсу"),
    "三菱": ("Mitsubishi", "Мицубиси"),
    "レクサス": ("Lexus", "Лексус"),
    "いすゞ": ("Isuzu", "Исузу"),
    "BMW": ("BMW", "БМВ"),
    "メルセデス・ベンツ": ("Mercedes-Benz", "Мерседес-Бенц"),
    "アウディ": ("Audi", "Ауди"),
    "フォルクスワーゲン": ("Volkswagen", "Фольксваген"),
    "ポルシェ": ("Porsche", "Порше"),
    "フェラーリ": ("Ferrari", "Феррари"),
    "ランボルギーニ": ("Lamborghini", "Ламборгини"),
    "ミニ": ("MINI", "Мини"),
    "ボルボ": ("Volvo", "Вольво"),
    "ジャガー": ("Jaguar", "Ягуар"),
    "ランドローバー": ("Land Rover", "Лэнд Ровер"),
    "フォード": ("Ford", "Форд"),
    "シボレー": ("Chevrolet", "Шевроле"),
    "キャデラック": ("Cadillac", "Кадиллак"),
    "テスラ": ("Tesla", "Тесла"),
    "ヒュンダイ": ("Hyundai", "Хёндэ"),
    "キア": ("Kia", "Киа"),
    "プジョー": ("Peugeot", "Пежо"),
    "ルノー": ("Renault", "Рено"),
    "シトロエン": ("Citroen", "Ситроен"),
    "フィアット": ("Fiat", "Фиат"),
    "アルファロメオ": ("Alfa Romeo", "Альфа Ромео"),
    "アルファ ロメオ": ("Alfa Romeo", "Альфа Ромео"),
    "シュコダ": ("Skoda", "Шкода"),
    "スマート": ("Smart", "Смарт"),
    "サーブ": ("Saab", "Сааб"),
    "アストンマーティン": ("Aston Martin", "Астон Мартин"),
    "ベントレー": ("Bentley", "Бентли"),
    "ロールスロイス": ("Rolls-Royce", "Роллс-Ройс"),
    "マセラティ": ("Maserati", "Мазерати"),
    "ヒノ": ("Hino", "Хино"),
    "GMC": ("GMC", "ДжиЭмСи"),
    "クライスラー": ("Chrysler", "Крайслер"),
    "ダッジ": ("Dodge", "Додж"),
    "ジープ": ("Jeep", "Джип"),
    "ハマー": ("Hummer", "Хаммер"),
    "リンカーン": ("Lincoln", "Линкольн"),
    "MG": ("MG", "МГ"),
    "ロータス": ("Lotus", "Лотус"),
    "マクラーレン": ("McLaren", "Макларен"),
}

BODY_TYPES: dict[str, tuple[str, str]] = {
    "セダン": ("Sedan", "Седан"),
    "クーペ": ("Coupe", "Купе"),
    "ステーションワゴン": ("Wagon", "Универсал"),
    "ワゴン": ("Wagon", "Универсал"),
    "ハッチバック": ("Hatchback", "Хэтчбек"),
    "SUV・クロカン": ("SUV", "Внедорожник"),
    "SUV": ("SUV", "Внедорожник"),
    "クロカン": ("SUV", "Внедорожник"),
    "ミニバン": ("Minivan", "Минивэн"),
    "ワンボックス": ("Van", "Фургон"),
    "コンパクトカー": ("Compact", "Компакт"),
    "軽自動車": ("Kei car", "Кей-кар"),
    "オープン": ("Convertible", "Кабриолет"),
    "オープンカー": ("Convertible", "Кабриолет"),
    "トラック": ("Truck", "Грузовик"),
    "バス": ("Bus", "Автобус"),
}

TRANSMISSIONS: dict[str, tuple[str, str]] = {
    "AT": ("AT", "АКПП"),
    "MT": ("MT", "МКПП"),
    "CVT": ("CVT", "Вариатор"),
    "フロアAT": ("AT", "АКПП"),
    "フロアMT": ("MT", "МКПП"),
    "コラムAT": ("AT", "АКПП"),
    "セミAT": ("AMT", "Роботизированная"),
    "DCT": ("DCT", "Преселективная"),
}

FUELS: dict[str, tuple[str, str]] = {
    "ガソリン": ("Gasoline", "Бензин"),
    "ハイオク": ("Gasoline (Premium)", "Бензин АИ-98"),
    "レギュラー": ("Gasoline (Regular)", "Бензин АИ-92"),
    "プレミアム": ("Gasoline (Premium)", "Бензин АИ-98"),
    "ハイブリッド": ("Hybrid", "Гибрид"),
    "ハイブリッド(ガソリン)": ("Hybrid", "Гибрид"),
    "ディーゼル": ("Diesel", "Дизель"),
    "軽油": ("Diesel", "Дизель"),
    "電気": ("Electric", "Электро"),
    "EV": ("Electric", "Электро"),
    "プラグインハイブリッド": ("PHEV", "Плагин-гибрид"),
    "LPG": ("LPG", "Газ"),
    "水素": ("Hydrogen", "Водород"),
    "天然ガス": ("CNG", "Природный газ"),
    "CNG": ("CNG", "Природный газ"),
}

DRIVES: dict[str, str] = {
    "FF": "FF",
    "FR": "FR",
    "4WD": "AWD",
    "AWD": "AWD",
    "MR": "MR",
    "RR": "RR",
    "2WD": "2WD",
}

COLORS: dict[str, tuple[str, str]] = {
    "ホワイト": ("White", "Белый"),
    "ブラック": ("Black", "Чёрный"),
    "シルバー": ("Silver", "Серебристый"),
    "グレー": ("Gray", "Серый"),
    "レッド": ("Red", "Красный"),
    "ブルー": ("Blue", "Синий"),
    "ネイビー": ("Navy", "Тёмно-синий"),
    "グリーン": ("Green", "Зелёный"),
    "イエロー": ("Yellow", "Жёлтый"),
    "オレンジ": ("Orange", "Оранжевый"),
    "ブラウン": ("Brown", "Коричневый"),
    "ベージュ": ("Beige", "Бежевый"),
    "ゴールド": ("Gold", "Золотистый"),
    "パープル": ("Purple", "Фиолетовый"),
    "ピンク": ("Pink", "Розовый"),
    "パール": ("Pearl White", "Белый перламутр"),
}


def _norm(s: str | None) -> str | None:
    if s is None:
        return None
    return s.strip().replace("\u3000", " ")


def translate(value: str | None, table: dict[str, tuple[str, str]]) -> tuple[str | None, str | None]:
    """Возвращает (EN-каноничное, оригинал JP). RU-значение получаем через отдельные функции при необходимости."""
    v = _norm(value)
    if not v:
        return None, None
    if v in table:
        return table[v][0], v
    for key, (en, _ru) in table.items():
        if key in v:
            return en, v
    return v, v


def translate_make(v: str | None) -> tuple[str | None, str | None]:
    return translate(v, MAKES)


def translate_body(v: str | None) -> tuple[str | None, str | None]:
    return translate(v, BODY_TYPES)


def translate_transmission(v: str | None) -> tuple[str | None, str | None]:
    return translate(v, TRANSMISSIONS)


def translate_fuel(v: str | None) -> tuple[str | None, str | None]:
    return translate(v, FUELS)


def translate_color(v: str | None) -> tuple[str | None, str | None]:
    return translate(v, COLORS)


def translate_drive(v: str | None) -> str | None:
    v = _norm(v)
    if not v:
        return None
    # CarSensor пишет "前輪駆動(FF)" — берём только код в скобках
    import re as _re
    m = _re.search(r"\((\w+)\)", v)
    if m:
        return DRIVES.get(m.group(1), m.group(1))
    return DRIVES.get(v, v)

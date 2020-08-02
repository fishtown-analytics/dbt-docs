
const selectors = require("./selector_methods");

test("Test splitting specs", () => {
    expect(
        selectors.splitSpecs('a b c')
    ).toStrictEqual(
        ['a', 'b', 'c']
    );

    expect(
        selectors.splitSpecs('a b  ')
    ).toStrictEqual(
        ['a', 'b']
    );

    expect(
        selectors.splitSpecs('a   c')
    ).toStrictEqual(
        ['a', 'c']
    );

    expect(
        selectors.splitSpecs(' b  c')
    ).toStrictEqual(
        ['b', 'c']
    );
});

test("Test splitting specs (intersection)", () => {
    expect(
        selectors.splitSpecs('a,b c')
    ).toStrictEqual(
        ['a,b', 'c']
    );

    expect(
        selectors.splitSpecs('a, b  ')
    ).toStrictEqual(
        ['a,', 'b']
    );
});

test("Test parsing specs (fqn)", () => {
    expect(
        selectors.parseSpec('a')
    ).toStrictEqual({
        select_at: false,
        select_children: false,
        select_parents: false,
        selector_type: 'fqn',
        selector_value: 'a',
        raw: 'a',
    });
})

test("Test parsing specs (fqn with parents and children)", () => {
    expect(
        selectors.parseSpec('+a+')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: true,
        selector_type: 'fqn',
        selector_value: 'a',
        raw: '+a+',
    });
})

test("Test parsing specs (at-syntax)", () => {
    expect(
        selectors.parseSpec('@a')
    ).toStrictEqual({
        select_at: true,
        select_children: false,
        select_parents: false,
        selector_type: 'fqn',
        selector_value: 'a',
        raw: '@a',
    });
})

test("Test parsing specs (explicit fqn)", () => {
    expect(
        selectors.parseSpec('@fqn:a')
    ).toStrictEqual({
        select_at: true,
        select_children: false,
        select_parents: false,
        selector_type: 'fqn',
        selector_value: 'a',
        raw: '@fqn:a',
    });
})

test("Test parsing specs (explicit tag)", () => {
    expect(
        selectors.parseSpec('@tag:a')
    ).toStrictEqual({
        select_at: true,
        select_children: false,
        select_parents: false,
        selector_type: 'tag',
        selector_value: 'a',
        raw: '@tag:a',
    });
})

test("Test parsing specs (explicit source)", () => {
    expect(
        selectors.parseSpec('source:a+')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: false,
        selector_type: 'source',
        selector_value: 'a',
        raw: 'source:a+',
    });
})

test("Test parsing specs (explicit source.table)", () => {
    expect(
        selectors.parseSpec('source:a.b+')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: false,
        selector_type: 'source',
        selector_value: 'a.b',
        raw: 'source:a.b+',
    });
})

test("Test parsing specs (scoped fqn)", () => {
    expect(
        selectors.parseSpec('a.b.c+')
    ).toStrictEqual({
        select_at: false,
        select_children: true,
        select_parents: false,
        selector_type: 'fqn',
        selector_value: 'a.b.c',
        raw: 'a.b.c+',
    });
})

test("Test set based selectors", () => {
    expect(
        selectors.parseSpecs('a,b c')
    ).toStrictEqual([
        {
            method: 'intersect',
            selectors: [
                {
                    select_at: false,
                    select_children: false,
                    select_parents: false,
                    selector_type: 'fqn',
                    selector_value: 'a',
                    raw: 'a',
                },
                {
                    select_at: false,
                    select_children: false,
                    select_parents: false,
                    selector_type: 'fqn',
                    selector_value: 'b',
                    raw: 'b',
                }
            ]
        },
        {
            method: 'none',
            selectors: [
                {
                    select_at: false,
                    select_children: false,
                    select_parents: false,
                    selector_type: 'fqn',
                    selector_value: 'c',
                    raw: 'c',
                }
            ]
        },
    ]);
})

test("Test set based selectors (complicated)", () => {
    expect(
        selectors.parseSpecs('tag:a,source:b.c mypackage fqn:a.b.c,tag:mytag+')
    ).toStrictEqual([
        {
            method: 'intersect',
            selectors: [
                {
                    select_at: false,
                    select_parents: false,
                    select_children: false,
                    selector_type: 'tag',
                    selector_value: 'a',
                    raw: 'tag:a'
                },
                {
                    select_at: false,
                    select_parents: false,
                    select_children: false,
                    selector_type: 'source',
                    selector_value: 'b.c',
                    raw: 'source:b.c'
                },
            ]
        },
        {
            method: 'none',
            selectors: [
                {
                    select_at: false,
                    select_parents: false,
                    select_children: false,
                    selector_type: 'fqn',
                    selector_value: 'mypackage',
                    raw: 'mypackage'
                },
            ]
        },
        {
            method: 'intersect',
            selectors: [
                {
                    select_at: false,
                    select_parents: false,
                    select_children: false,
                    selector_type: 'fqn',
                    selector_value: 'a.b.c',
                    raw: 'fqn:a.b.c'
                },
                {
                    select_at: false,
                    select_parents: false,
                    select_children: true,
                    selector_type: 'tag',
                    selector_value: 'mytag',
                    raw: 'tag:mytag+'
                },
            ]
        },
    ]);
})

test("Test parsing invalid spec", () => {
    expect(() => {
        selectors.parseSpec('@a+')
    }).toThrow();
})


test("Test applying selector specs", () => {
    var lookup = {
        a: {matched: [1], selected: [1]},
        b: {matched: [2], selected: [2]},
        c: {matched: [3], selected: [3]},
    }

    expect(
        selectors.applySpec('a b c', (el) => lookup[el.raw])
    ).toStrictEqual({
        matched: [1,2,3],
        selected: [1,2,3],
    })
})

test("Test applying selector specs with intersection", () => {
    var lookup = {
        a: {matched: [1,2], selected: [1,2]},
        b: {matched: [2,3], selected: [2,3]},
        c: {matched: [3], selected: [3]}
    }

    expect(
        selectors.applySpec('a,b c', (el) => lookup[el.raw])
    ).toStrictEqual({
        matched: [2, 3],
        selected: [2, 3]
    })
})

test("Test parsing specs", () => {
    expect(
        selectors.buildSpec(
            "a,tag:b+ c",
            "d",
            1
        )
    ).toStrictEqual({
        include: [
            {
                method: 'intersect',
                selectors: [
                    {
                        select_at: false,
                        select_parents: false,
                        select_children: false,
                        selector_type: 'fqn',
                        selector_value: 'a',
                        raw: 'a'
                    },
                    {
                        select_at: false,
                        select_parents: false,
                        select_children: true,
                        selector_type: 'tag',
                        selector_value: 'b',
                        raw: 'tag:b+'
                    }
                ]
            },
            {
                method: 'none',
                selectors: [
                    {
                        select_at: false,
                        select_parents: false,
                        select_children: false,
                        selector_type: 'fqn',
                        selector_value: 'c',
                        raw: 'c'
                    },
                ]
            }
        ],
        exclude: [
            {
                method: 'none',
                selectors: [
                    {
                        select_at: false,
                        select_parents: false,
                        select_children: false,
                        selector_type: 'fqn',
                        selector_value: 'd',
                        raw: 'd'
                    },
                ]
            }
        ],
        hops: 1
    })
})
// Run me with Node to see my output!
import React from "react";
import P from "parsimmon";

// Operators should allow whitespace around them, but not require it. This
// helper combines multiple operators together with names.
//
// Example: operators({Add: "+", Sub: "-"})
//
// Gives back an operator that parses either + or - surrounded by optional
// whitespace, and gives back the word "Add" or "Sub" instead of the character.
// function operators(ops) {
//   let keys = Object.keys(ops);
//   let ps = keys.map(k =>
//     P.string(ops[k])
//       .trim(P.optWhitespace)
//       .result(k)
//   );
//   return P.alt.apply(null, ps);
// }

// Takes a parser for the prefix operator, and a parser for the base thing being
// parsed, and parses as many occurrences as possible of the prefix operator.
// Note that the parser is created using `P.lazy` because it"s recursive. It"s
// valid for there to be zero occurrences of the prefix operator.
//
var Lang = P.createLanguage({
  Separator: () => P.string("|"),
  ParentSeparator: () => P.string("->"),
  StartScope: () => P.string(":"),
  StartValue: () => P.regex(/-?[\t ]*/),

  Header: (r) =>
    P.regex(/.+(?=:)/).map((res) =>
      P.regex(/[\w,\s]+/)
        .sepBy(r.Separator)
        .tryParse(res)
    ),
  Value: (r) =>
    P.regex(/^[\w\n]*.+(?<![:(->)][\t ]*)(?:\n|$)/).map((res) =>
      P.regex(/[\w,\s]+/)
        .sepBy(r.Separator)
        .tryParse(res)
    ),
  Row: (r) =>
    P.seqObj(r.StartValue, ["value", P.alt(P.whitespace, r.Value)]).map(
      (res) => res.value
    ),
  Parent: (r) =>
    P.seqObj(["value", P.regex(/.+(?=->)/)], r.ParentSeparator).map(
      (res) => res.value
    ),

  FieldParser: (r) =>
    P.seqObj(
      P.optWhitespace,
      ["header", r.Header],
      r.StartScope,
      P.optWhitespace,
      ["rows", P.alt(r.Row, P.whitespace).many()]
    ).many(),

  ResourceParser: (r) =>
    P.seqObj(
      P.optWhitespace,
      ["parent_header", r.Parent],
      ["header", P.alt(P.whitespace, r.Header)],
      r.StartScope,
      P.optWhitespace,
      [
        "values",
        P.seqObj(
          ["parent_row", P.alt(P.whitespace, r.Parent)],
          P.optWhitespace,
          ["rows", P.alt(P.whitespace, r.Row).many()]
        ).many()
      ]
    ).many()
});
const fieldResult = Lang.FieldParser.tryParse(`
  field|en|enums|jx:
  


  campaign_status|active,inactive

  campaign_namhge

  field|en|enums|jz:
  campaign_status|active,inactive
  campaign_name
`);

const resourceResult = Lang.ResourceParser.tryParse(`
resources->fields|incompatible_fields:
campaign,account->
- campaign_status|campaign_name,campaign_id
- ad_id|account_id
ad->
- 
`);

///////////////////////////////////////////////////////////////////////

export const MathDebug = () => {
  return <pre>{JSON.stringify(fieldResult, null, 2)}</pre>;
};
